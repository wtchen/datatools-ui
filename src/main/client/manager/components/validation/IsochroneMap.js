import React from 'react'
import { Map, Marker, Popup, TileLayer, Rectangle, GeoJson, FeatureGroup } from 'react-leaflet'

import ValidationMap from './ValidationMap'

export default class IsochroneMap extends ValidationMap {

  constructor (props) {
    super(props)
  }

  mapClicked (e) {
    this.fetchIsochrones(e.latlng)
  }

  fetchIsochrones (latlng) {
    const center = super.getMap().leafletElement.getCenter()
    this.props.fetchIsochrones(this.props.version, latlng.lat, latlng.lng, center.lat, center.lng)
    this.setState({ lastClicked: latlng })
  }

  getMapComponents () {
    let comps = []

    if (this.props.version && this.props.version.isochrones) {
      comps = this.props.version.isochrones.features.map((iso, index) => {
        if (iso.properties.time !== 60*60) return null
        return (
          <GeoJson
            key={Math.random()}
            data={{type: 'MultiPolygon', coordinates: iso.geometry.coordinates}}
            color={'blue'}
            style={(feature) => {
              return {
                color: this.getIsochroneColor(iso.properties.time),
              }
            }}
          />
        )
      })
    }

    if (this.state && this.state.lastClicked) {
      comps.push(
        <Marker
          key='marker'
          position={this.state.lastClicked}
          draggable
          onDragEnd={(e) => {
            this.fetchIsochrones(e.target.getLatLng())
          }}
        />
      )
    }

    return comps
  }

  getIsochroneColor (time) {
    return time ? 'blue' : 'red'
  }
}
