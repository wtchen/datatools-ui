// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { PureComponent } from 'react'
import { EditControl } from 'react-leaflet-draw'
import {FeatureGroup, Polygon, Polyline} from 'react-leaflet'

import * as locationStrategiesActions from '../../actions/map/locationStrategies'
import type { GtfsLocation, LocationShape } from '../../../types'

type GroupedLocationShapePts = {
  [string]: Array<[number, number]>
}

type Props = {
  activeEntity: GtfsLocation,
  updateLocationShape: typeof locationStrategiesActions.updateLocationShape
}

type State = {
  initialShapeIds: Array<string>
}

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

    this.props.updateLocationShape(geometryType, locationShapes)
  }

  _onDeleted (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const { layers: {_layers: layers} } = e

    let locationShapes = clone(activeEntity.location_shapes)
    let layerType = null
    Object.values(layers).map(layer => {
      if (layer !== null && typeof layer === 'object' && layer.hasOwnProperty('_leaflet_id')) {
        const {_leaflet_id: leafletId, _latlngs: coordSet} = layer

        // Fail if layer isn't as we expect
        // Very explicit checks to keep flow happy
        if (
          !!coordSet &&
          typeof coordSet === 'object' && // Arrays are objects
          (coordSet.length && typeof coordSet.length === 'number' && coordSet.length > 0)
        ) {
          const isPolygon = layer instanceof L.Polygon
          // FIXME: support all layer types once all layer types can be created in editor
          // via switch statement or similar
          layerType = isPolygon ? 'polygon' : 'polyline'

          // Polygons have 2D latlng object structure
          // $FlowFixMe flow doesn't understand that arrays are objects. Can this typecheck be done cleaner?
          const layerCoords = isPolygon ? coordSet[0].map(latlng => [latlng.lat, latlng.lng]) : coordSet.map(latlng => [latlng.lat, latlng.lng])

          // If dealing with a shape fromSaved, the editcontrol has changed the leaflet ID
          // TODO: fix this more elegantly w/ the forked react-leaflet-draw repo here: https://www.npmjs.com/package/@andrewdodd/react-leaflet-draw
          // (which requires React 16) or use refs.
          // Create our locations shape out of the bulk location shape points
          // TODO: create a function for this since it's shared with onEdited?
          const groupedLocationShapePts: GroupedLocationShapePts = locationShapes.reduce((acc, cur) => {
            if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [cur.geometry_pt_lat, cur.geometry_pt_lon]
            else acc[cur.geometry_id].push([cur.geometry_pt_lat, cur.geometry_pt_lon])
            return acc
          }, {})

          // Get the geometry_ids that match the deleted shape
          const onDeletedKeys: Array<string> = Object.keys(groupedLocationShapePts).filter(key => {
            if (key === leafletId) return false
            else if (this.checkSameShape(groupedLocationShapePts[key], layerCoords)) return false
            else return true
          })

          // Filter deleted geometry_ids out of the bulk locationShapes data
          locationShapes = locationShapes.filter(shapePt => {
            if (onDeletedKeys.includes(shapePt.geometry_id)) return false
            else return true
          })
        }
      }
    })

    if (layerType !== null) this.props.updateLocationShape(layerType, locationShapes)
  }

  _onEdited (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const {layers: { _layers: layers }} = e

    let layerType = null
    let locationShapes = clone(activeEntity.location_shapes)
    Object.values(layers).map((layer: L.Polygon | L.Polyline) => {
      // Do a manual and complicated type check
      if (typeof layer !== 'object' || !layer.editing || !layer._leaflet_id || !layer._latlngs) return
      const {editing} = layer

      const isPolygon = layer instanceof L.Polygon
      // FIXME: support all layer types once all layer types can be created in editor
      // via switch statement or similar
      layerType = isPolygon ? 'polygon' : 'polyline'

      const formattedEditedCoords = isPolygon
        ? editing.latlngs[0][0].map(latlng => [latlng.lat, latlng.lng])
        : editing.latlngs[0].map(latlng => [latlng.lat, latlng.lng])

      locationShapes = formattedEditedCoords.map((coordPair, index) => {
        return {
          geometry_id: locationShapes[0].geometry_id, // HACK: We are only allowing one geometry per location right now...
          geometry_pt_lat: coordPair[0],
          geometry_pt_lon: coordPair[1],
          id: index
        }
      })
    })

    if (layerType !== null) this.props.updateLocationShape(layerType, locationShapes)
  }

  render () {
    const {activeEntity} = this.props
    const {geometry_type: geometryType, location_shapes: locationShapes} = activeEntity

    // Create our locations shape out of the bulk location shape points
    const groupedLocationShapePts: GroupedLocationShapePts = locationShapes.reduce((acc, cur) => {
      if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [[cur.geometry_pt_lat, cur.geometry_pt_lon]]
      else acc[cur.geometry_id].push([cur.geometry_pt_lat, cur.geometry_pt_lon])
      return acc
    }, {})

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
            onCreated={(e) => this._onCreated(e)}
            onDeleted={(e) => this._onDeleted(e)}
            onDrawStart={(e) => this._onDrawStart(e)}
            onEdited={(e) => this._onEdited(e)}
            position='topleft'
          />
          {locationShapes && this.state.initialShapeIds.length > 0 && Object.keys(groupedLocationShapePts).map(key => {
            return this.state.initialShapeIds.includes(key) && geometryType === 'polygon'
              ? <Polygon key={key} positions={groupedLocationShapePts[key]} />
              : <Polyline key={key} positions={groupedLocationShapePts[key]} />
          })}
        </FeatureGroup>
      </div>
    )
  }
}
