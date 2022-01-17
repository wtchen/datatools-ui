// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { PureComponent } from 'react'
import { EditControl } from 'react-leaflet-draw'
import {FeatureGroup, Polygon, Polyline} from 'react-leaflet'

import * as locationStrategiesActions from '../../actions/map/locationStrategies'
import type { GtfsLocation, LocationShape, LocationShapePoint } from '../../../types'

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
    this.state.initialShapeIds = locationShapes.reduce((acc, currentShape) => {
      const uniqueIds = [...new Set(currentShape.map(shapePt => shapePt.geometry_id))]
      acc = [...acc, ...uniqueIds]
      return acc
    }, [])
  }

  checkSameShape = (shape: LocationShape, layerCoords: Array<[number, number]>) => {
    // We receive layerCoords in an array of coordinates [[YY.YYY, ZZ.ZZZZ], [..]]
    // We then package geometryCoords back into a similar array to compare
    // TODO: this function is not set up to handle the case where coords represents a single polygon
    // and shape represents multiple (i.e. MultiPolygons)
    const geometryCoords = shape.forEach(shapePt => [shapePt.geometry_pt_lat, shapePt.geometry_pt_lon])
    return JSON.stringify(geometryCoords) === JSON.stringify(layerCoords)
  }

  _onCreated (e: L.LeafletEvent) {
    const {layer, layer: {_leaflet_id: leafletId}, layerType: geometryType} = e
    const {activeEntity} = this.props

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

    const locationShapes = [...clone(activeEntity.location_shapes), locationShape]

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
          locationShapes = locationShapes.filter(shape => {
            shape.forEach(shapePt => {
              if (shapePt.geometry_id !== leafletId) return true
              else if (!this.checkSameShape(shape, layerCoords)) return true
              else return false
            })
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
    Object.values(layers).map(layer => {
      // Do a manual and complicated type check
      if (!typeof layers !== 'object' || !layers.editing || !layers._leaflet_id || !layers._latlngs) return
      // $FlowFixMe Flow doesn't understand our type check
      const {_leaflet_id: leafletId, editing, _latlngs: coordSet} = layer

      const isPolygon = layer instanceof L.Polygon
      // FIXME: support all layer types once all layer types can be created in editor
      // via switch statement or similar
      layerType = isPolygon ? 'polygon' : 'polyline'

      const formattedOriginalCoords = isPolygon ? coordSet[0].map(latlng => [latlng.lat, latlng.lng]) : coordSet.map(latlng => [latlng.lat, latlng.lng])
      const formattedEditedCoords = isPolygon
        ? editing.latlngs[0][0].map(latlng => [latlng.lat, latlng.lng])
        : editing.latlngs[0].map(latlng => [latlng.lat, latlng.lng])

      locationShapes = locationShapes.map(locationShape => {
        const existingGeometryIds = [...new Set(locationShape.map(shapePt => shapePt.geometry_id))]
        if (existingGeometryIds.includes(leafletId)) {
          // Extract the existing "id" field before deletion
          let id
          // Delete existing, update w/ edited coords
          const editedShape = locationShape.filter((shapePt, index) => {
            if (shapePt.geometry_id === leafletId) {
              if (index === 0) id = shapePt.id
              return false
            } else return true
          })
          formattedEditedCoords.forEach(coordSet => {
            editedShape.push({
              geometry_id: leafletId,
              geometry_pt_lat: coordSet[0],
              geometry_pt_lon: coordSet[1],
              id
            })
          })
          return editedShape
        } else if (this.checkSameShape(locationShape, formattedOriginalCoords)) {
          // checkSameShape assumes (for now) that locationShape is a single polygon or polyline
          // Therefore geometry_id and id are constant:
          const {geometry_id: geometryId, id} = locationShape[0] // the first location shape point
          const editedShape = formattedEditedCoords.forEach(coordSet => {
            editedShape.push({
              geometry_id: geometryId,
              geometry_pt_lat: coordSet[0],
              geometry_pt_lon: coordSet[1],
              id
            })
          })
          return editedShape
        } else return locationShape
      })
    })

    if (layerType !== null) this.props.updateLocationShape(layerType, locationShapes)
  }

  render () {
    const {activeEntity} = this.props
    const {geometry_type: geometryType, location_shapes: locationShapes} = activeEntity

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
            onEdited={(e) => this._onEdited(e)}
            position='topleft'
          />
          {locationShapes && this.state.initialShapeIds.length > 0 && locationShapes.map((locationShape, i) => {
            const positions = locationShape.map((shapePt: LocationShapePoint) => [shapePt.geometry_pt_lat, shapePt.geometry_pt_lon])
            // TODO: Don't assume that there is only one geometry_id per shape (i.e. allow multipolygons, multipolylines)
            const geometryId = locationShape[0].geometry_id
            // Render only fromSaved shapes so that EditControl layers are not caught here
            // (creates duplicate shapes)
            return this.state.initialShapeIds.includes(geometryId) && (
              geometryType === 'polygon'
                ? <Polygon key={geometryId} positions={positions} />
                : <Polyline key={geometryId} positions={positions} />
            )
          })}
        </FeatureGroup>
      </div>
    )
  }
}
