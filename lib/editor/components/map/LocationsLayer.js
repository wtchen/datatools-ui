// @flow

import { EditControl } from 'react-leaflet-draw'
import React, { PureComponent } from 'react'
import {FeatureGroup} from 'react-leaflet'

export default class LocationsLayer extends PureComponent<Props> {
  _onCreated (e) {
    const { layer, layer: {_leaflet_id: leafletId} } = e
    const { activeEntity } = this.props

    const locationShape = {
      id: leafletId,
      latlngs: [...layer.getLatLngs()[0]]
    }
    const locationShapes = [...activeEntity.locationShapes, locationShape]

    this.props.updateLocationShape(locationShapes)
  }

  _onDeleted (e) {
    const {activeEntity} = this.props
    const { layers: {_layers: layers} } = e

    let locationShapes = [...activeEntity.locationShapes]
    Object.values(layers).map(layer => {
      const {_leaflet_id: leafletId} = layer
      locationShapes = locationShapes.filter(shape => shape.id !== leafletId)
    })

    this.props.updateLocationShape(locationShapes)
  }

  _onEdited (e) {
    const {activeEntity} = this.props
    const {layers: { _layers: layers }} = e

    let locationShapes = [...activeEntity.locationShapes]
    Object.values(layers).map(({_leaflet_id: leafletId, editing}) => {
      locationShapes = locationShapes.map(shape => shape.id === leafletId
        ? {...shape, latlngs: [...editing.latlngs[0][0]]}
        : shape
      )
    })

    this.props.updateLocationShape(locationShapes)
  }

  render () {
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
        </FeatureGroup>
      </div>
    )
  }
}
