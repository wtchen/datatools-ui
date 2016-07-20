import React from 'react'
import { Map, Marker, Popup, TileLayer, Rectangle, GeoJson, FeatureGroup } from 'react-leaflet'

export default class ValidationMap extends React.Component {

  constructor (props) {
    super(props)
  }

  getMap() {
    return this.refs.map
  }

  initializeMap() {
    if(this.mapInitialized || this.props.initialized) return
    const leafletMap = this.getMap().leafletElement
    leafletMap.invalidateSize()
    const summary = this.props.version.validationSummary
    const bounds = [[summary.bounds.north, summary.bounds.east], [summary.bounds.south, summary.bounds.west]]
    leafletMap.fitBounds(bounds)
    this.mapInitialized = true
  }

  mapClicked (evt) { }

  getMapComponents () {
    return null
  }

  render () {
    const version = this.props.version
    const summary = version.validationSummary
    const bounds = [[summary.bounds.north, summary.bounds.east], [summary.bounds.south, summary.bounds.west]]

    const mapStyle = {
      height: '620px',
    }

    return (
      <Map
        ref='map'
        style={mapStyle}
        bounds={bounds}
        onClick={(e) => this.mapClicked(e)}
        scrollWheelZoom={true}
      >
        <TileLayer
          url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />

        <Rectangle
          bounds={bounds}
          fillOpacity={0}
        />

        {this.getMapComponents()}

      </Map>
    )
  }
}
