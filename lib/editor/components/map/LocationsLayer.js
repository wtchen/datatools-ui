// @flow

import * as L from 'leaflet'
import clone from 'lodash/cloneDeep'
import React, { PureComponent } from 'react'
import { EditControl } from 'react-leaflet-draw'
import {FeatureGroup, Polygon, Polyline} from 'react-leaflet'
import {connect} from 'react-redux'

import * as locationStrategiesActions from '../../actions/map/locationStrategies'
import type { GtfsLocation } from '../../../types'

type Props = {
  activeEntity: GtfsLocation,
  updateLocationShape: typeof locationStrategiesActions.updateLocationShape
}

class LocationsLayer extends PureComponent<Props> {
  state = {
    initialShapeIds: []
  }

  constructor (props) {
    super(props)
    const locationShapes = this.props.activeEntity.location_shapes
    this.state.initialShapeIds = locationShapes.map(shape => shape.geometry_id)
    console.log('We constructed the LocationsLayer')
  }

  checkSameShape = (geometryCoords, layerCoords) => {
    return JSON.stringify(geometryCoords) === JSON.stringify(layerCoords)
  }

  _onCreated (e: L.LeafletEvent) {
    const {layer, layer: {_leaflet_id: leafletId}, layerType} = e
    const {activeEntity} = this.props

    const locationShape = {
      // For a polygon, leaflet coords are nested (as in multi polyline as well)
      geometry_coords: layerType === 'polygon'
        ? layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng])
        : layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]),
      fromSaved: false,
      geometry_id: leafletId,
      geometry_type: layerType
    }
    const locationShapes = [...clone(activeEntity.location_shapes), locationShape]

    this.props.updateLocationShape(locationShapes)
  }

  _onDeleted (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const { layers: {_layers: layers} } = e

    let locationShapes = clone(activeEntity.location_shapes)
    Object.values(layers).map(layer => {
      if (layer !== null && typeof layer === 'object' && layer.hasOwnProperty('_leaflet_id')) {
        const {_leaflet_id: leafletId, _latlngs: coordSet} = layer
        const isPolygon = layer instanceof L.Polygon

        // Polygons have 2D latlng object structure
        const layerCoords = isPolygon ? coordSet[0].map(latlng => [latlng.lat, latlng.lng]) : coordSet.map(latlng => [latlng.lat, latlng.lng])

        // If dealing with a shape fromSaved, the editcontrol has changed the leaflet ID
        // TODO: fix this more elegantly w/ the forked react-leaflet-draw repo here: https://www.npmjs.com/package/@andrewdodd/react-leaflet-draw
        // (which requires React 16) or use refs.
        locationShapes = locationShapes.filter(shape => {
          if (shape.geometry_id !== leafletId && !shape.fromSaved) return true
          else if (shape.fromSaved && !this.checkSameShape(shape.geometry_coords, layerCoords)) return true
          else return false
        })
      }
    })

    this.props.updateLocationShape(locationShapes)
  }

  _onEdited (e: L.LeafletEvent) {
    const {activeEntity} = this.props
    const {layers: { _layers: layers }} = e

    let locationShapes = clone(activeEntity.location_shapes)
    Object.values(layers).map(({_leaflet_id: leafletId, editing}: any) => {
      locationShapes = locationShapes.map(shape => shape.geometry_id === leafletId
        ? {...shape, geometry_coords: [...editing.latlngs[0][0]]}
        : shape
      )
    })

    this.props.updateLocationShape(locationShapes)
  }

  // componentWillUnmount = () => {
  //   const { activeEntity } = this.props
  //   let locationShapes = clone(activeEntity.location_shapes)

  //   // Flip each saved shape that made it this far to be "fromSaved"
  //   locationShapes = locationShapes.map(locationShape => {
  //     if (!locationShape.fromSaved) locationShape.fromSaved = true
  //     return locationShape
  //   })

  //   this.props.updateLocationShape(locationShapes)
  // }

  render () {
    const {activeEntity} = this.props
    const {initialShapeIds} = this.props
    const {location_shapes: locationShapes} = activeEntity

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
          {locationShapes && initialShapeIds && Object.keys(locationShapes).map((key, i) => {
            const locationShape = locationShapes[key]
            const positions = locationShape.geometry_coords
            // Render only fromSaved shapes so that EditControl layers are not caught here
            // (creates duplicate shapes)
            return initialShapeIds.includes(locationShape.geometry_id) && (
              locationShape.geometry_type === 'polygon'
                ? <Polygon key={i} positions={positions} />
                : <Polyline key={i} positions={positions} />
            )
          })}
        </FeatureGroup>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {active} = state.editor.data
  return {
    initialShapeIds: active.entity.initial_location_shape_ids || null
  }
}

export default connect(mapStateToProps)(LocationsLayer)
