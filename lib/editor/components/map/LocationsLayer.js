// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { PureComponent } from 'react'
import { EditControl } from 'react-leaflet-draw'
import {FeatureGroup, Polygon, Polyline} from 'react-leaflet'

import * as locationStrategiesActions from '../../actions/map/locationStrategies'
import type { GtfsLocation } from '../../../types'

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
    this.state.initialShapeIds = locationShapes.map(shape => shape.geometry_id)
  }

  checkSameShape = (geometryCoords: Array<[number, number]>, layerCoords: Array<[number, number]>) => {
    return JSON.stringify(geometryCoords) === JSON.stringify(layerCoords)
  }

  _onCreated (e: L.LeafletEvent) {
    const {layer, layer: {_leaflet_id: leafletId}, layerType: geometryType} = e
    const {activeEntity} = this.props

    // TODO: unify geometryType w/ backend types, including detecting MULTIPOLYGON & MULTILINESTRING
    const locationShape = {
      // For a polygon, leaflet coords are nested (as in multi polyline as well)
      geometry_coords: geometryType === 'polygon'
        ? layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng])
        : layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]),
      geometry_id: leafletId,
      id: activeEntity.location_shapes.length
    }
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
            if (shape.geometry_id !== leafletId) return true
            else if (!this.checkSameShape(shape.geometry_coords, layerCoords)) return true
            else return false
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

      // TODO: destructure polyline coords properly.
      locationShapes = locationShapes.map(shape => shape.geometry_id === leafletId
        ? {...shape, geometry_coords: [...formattedEditedCoords]}
        : this.checkSameShape(shape.geometry_coords, formattedOriginalCoords)
          ? {...shape, geometry_coords: [...formattedEditedCoords]}
          : shape
      )
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
            const positions = locationShape.geometry_coords
            const geometryId = locationShape.geometry_id
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
