// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { PureComponent } from 'react'
import { EditControl } from 'react-leaflet-draw'
import {FeatureGroup, Polygon, Polyline} from 'react-leaflet'

import * as activeActions from '../../actions/active'
import type { GtfsLocation, LocationShape } from '../../../types'
import { convertLatLngToArray, groupLocationShapePoints } from '../../util/location'

type GroupedLocationShapePts = {
  [string]: Array<[number, number]>
}

type Props = {
  activeEntity: GtfsLocation,
  updatingLocationShape: typeof activeActions.updatingLocationShape
}

type State = {
  initialShapeIds: Array<string>
}

/**
 * Draw all locations on a map and render a popup on click
 */
export default class LocationsLayer extends PureComponent<Props, State> {
  state = {
    initialShapeIds: []
  }

  constructor (props: Props) {
    super(props)
    const locationShapes = this.props.activeEntity.location_shapes
    // Extract all the unique geometry IDs out of the location shape points.
    this.state.initialShapeIds = [...new Set(locationShapes.map(shapePt => shapePt.geometry_id))]
  }

  checkSameShape = (shape: Array<[number, number]>, layerCoords: Array<[number, number]>) => {
    // We receive layerCoords in an array of coordinates [[YY.YYY, ZZ.ZZZZ], [..]]
    // We then package geometryCoords back into a similar array to compare
    // TODO: this function is not set up to handle the case where coords represents a single polygon
    // and shape represents multiple (i.e. MultiPolygons)
    // const geometryCoords = shape.forEach(shapePt => [shapePt.geometry_pt_lat, shapePt.geometry_pt_lon])
    return JSON.stringify(shape) === JSON.stringify(layerCoords)
  }

  _onDrawStart (e: L.LeafletEvent) {
    const {layerType} = e
    const {geometry_type: geometryType} = this.props.activeEntity

    if (geometryType && layerType !== geometryType) {
      window.alert('Mixed location geometry types are not supported by the GTFS flex specification.')
    }
  }

  _onCreated (e: L.LeafletEvent) {
    const {layer, layer: {_leaflet_id: leafletId}, layerType: geometryType} = e
    const {activeEntity} = this.props

    // TODO: allow multi polygon type
    if (activeEntity.location_shapes.length > 0) {
      window.alert('MultiPolygons / Multipolylines are not currently supported.')
      // TODO: clear the EditControl in a better way
      location.reload()
      return
    }

    // TODO: unify geometryType w/ backend types, including detecting MULTIPOLYGON & MULTILINESTRING
    // Construct a location type as an array of location shape points.
    const locationShape: LocationShape = geometryType === 'polygon'
      ? layer.getLatLngs()[0].map(latlng => {
        return {
          geometry_id: leafletId,
          geometry_pt_lat: latlng.lat,
          geometry_pt_lon: latlng.lng,
          id: activeEntity.location_shapes.length
        }
      })
      : layer.getLatLngs().map(latlng => {
        return {
          geometry_id: leafletId,
          geometry_pt_lat: latlng.lat,
          geometry_pt_lon: latlng.lon,
          id: activeEntity.location_shapes.length
        }
      })

    // Save locationShapes "in bulk" (i.e. as an array of locationShapePt objects)
    // and they can be differentiated by geometry_id
    const locationShapes = clone(activeEntity.location_shapes).concat(...locationShape)

    this.props.updatingLocationShape({ geometryType, shapes: locationShapes })
  }

  _onDeleted (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const { layers: {_layers: layers} } = e

    let locationShapes = clone(activeEntity.location_shapes)
    let layerType = null
    Object.values(layers)
      .filter(
        (layer) =>
          layer !== null &&
          typeof layer === 'object' &&
          layer.hasOwnProperty('_leaflet_id') &&
          layer.hasOwnProperty('_latlngs') &&

          // Fail if layer isn't as we expect
          // Very explicit checks to keep flow happy
          layer.hasOwnProperty('coordSet') &&
          !!layer.coordSet &&
          typeof layer.coordSet === 'object' &&
          layer.coordSet.length &&
          typeof layer.coordSet.length === 'number' &&
          layer.coordSet.length > 0
      )
      .map((layer) => {
        // $FlowFixMe flow doesn't understand filter
        const { _leaflet_id: leafletId, _latlngs: coordSet } = layer

        const isPolygon = layer instanceof L.Polygon
        // FIXME: support all layer types once all layer types can be created in editor
        // via switch statement or similar
        layerType = isPolygon ? 'polygon' : 'polyline'

        // Polygons have 2D latlng object structure
        const layerCoords = isPolygon
          ? coordSet[0].map(convertLatLngToArray)
          : coordSet.map(convertLatLngToArray)

        // If dealing with a shape fromSaved, the editcontrol has changed the leaflet ID
        // TODO: fix this more elegantly w/ the forked react-leaflet-draw repo here: https://www.npmjs.com/package/@andrewdodd/react-leaflet-draw
        // (which requires React 16) or use refs.
        // Create our locations shape out of the bulk location shape points
        // TODO: create a function for this since it's shared with onEdited?
        const groupedLocationShapePts: GroupedLocationShapePts = groupLocationShapePoints(
          locationShapes
        )

        // Get the geometry_ids that match the deleted shape
        const onDeletedKeys: Array<string> = Object.keys(
          groupedLocationShapePts
        ).filter((key) => {
          if (key === leafletId) return false
          if (this.checkSameShape(groupedLocationShapePts[key], layerCoords)) { return false }
          return true
        })

        // Filter deleted geometry_ids out of the bulk locationShapes data
        locationShapes = locationShapes.filter((shapePt) => {
          if (onDeletedKeys.includes(shapePt.geometry_id)) return false
          return true
        })
      })

    if (layerType) this.props.updatingLocationShape({ geometryType: layerType, shapes: locationShapes })
  }

  _onEdited (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const {layers: { _layers: layers }} = e

    let layerType = null
    let locationShapes = clone(activeEntity.location_shapes)
    Object.values(layers)
      .filter(layer => !!layer && typeof layer === 'object' && layer.hasOwnProperty('editing') && layer.hasOwnProperty('_leaflet_id') && layer.hasOwnProperty('_latlngs'))
      .map((layer: L.Polygon | L.Polyline) => {
      // Do a manual and complicated type check
        const {editing} = layer

        const isPolygon = layer instanceof L.Polygon
        // FIXME: support all layer types once all layer types can be created in editor
        // via switch statement or similar
        layerType = isPolygon ? 'polygon' : 'polyline'

        const formattedEditedCoords = isPolygon
          ? editing.latlngs[0][0].map(convertLatLngToArray)
          : editing.latlngs[0].map(convertLatLngToArray)

        locationShapes = formattedEditedCoords.map((coordPair, index) => (
          {
            geometry_id: locationShapes[0].geometry_id, // HACK: We are only allowing one geometry per location right now...
            geometry_pt_lat: coordPair[0],
            geometry_pt_lon: coordPair[1],
            id: index
          }
        ))
      })

    if (layerType) this.props.updatingLocationShape({ geometryType: layerType, shapes: locationShapes })
  }

  render () {
    const {activeEntity} = this.props
    const {geometry_type: geometryType, location_shapes: locationShapes} = activeEntity

    // Create our locations shape out of the bulk location shape points
    const groupedLocationShapePts: GroupedLocationShapePts = groupLocationShapePoints(locationShapes)

    return (
      <div id='location-features-layer'>
        <FeatureGroup>
          <EditControl
            draw={{
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: true,
              polyline: true,
              rectangle: false
            }}
            onCreated={e => this._onCreated(e)}
            onDeleted={e => this._onDeleted(e)}
            onDrawStart={e => this._onDrawStart(e)}
            onEdited={e => this._onEdited(e)}
            position='topleft'
          />
          {locationShapes && this.state.initialShapeIds.length > 0 && Object.keys(groupedLocationShapePts).map(key => {
            const Shape = this.state.initialShapeIds.includes(key) && geometryType === 'polygon' ? Polygon : Polyline
            return <Shape key={key} positions={groupedLocationShapePts[key]} />
          })}
        </FeatureGroup>
      </div>
    )
  }
}
