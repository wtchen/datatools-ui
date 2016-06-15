import React from 'react'
import { Map, Marker, CircleMarker, Popup, TileLayer, Rectangle, GeoJson, FeatureGroup, ZoomControl } from 'react-leaflet'
import { browserHistory, Link } from 'react-router'
import { PureComponent, shallowEqual } from 'react-pure-render'

export default class EditorMap extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
    if (!shallowEqual(nextProps.entity,this.props.entity)) {
      // this.zoomToEntity(nextProps.entity)
    }
  }
  zoomToEntity (entity) {
    if (entity && entity.stop_id) {
      this.refs.map.getLeafletElement().panTo([entity.stop_lat, entity.stop_lon])
    }
  }
  // getMap() {
  //   return this.refs.map
  // }

  // initializeMap() {
  //   if(this.mapInitialized || this.props.initialized) return
  //   const leafletMap = this.getMap().getLeafletElement()
  //   leafletMap.invalidateSize()
  //   //const bounds = [[summary.bounds.north, summary.bounds.east], [summary.bounds.south, summary.bounds.west]]
  //   //leafletMap.fitBounds(bounds)
  //   this.mapInitialized = true
  // }

  mapClicked (evt) { }

  getMapComponents (component, entities) {
    switch (component) {
      case 'route':
        return entities ? entities.map(route => {
          return (
            null
          )
        })
        : null
      case 'stop':
        return entities ? entities.map(stop => {
          console.log(isNaN(stop.stop_lat))
          if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon))
            return null
          const stopLatLng = [stop.stop_lat, stop.stop_lon]
          const marker = (
            <CircleMarker
              center={stopLatLng}
              //key={`${this.props.activeComponent}-marker-${stop.stop_id}`}
              color={this.props.entity && this.props.entity === stop.stop_id ? 'red' : 'blue'}
              radius={4}
              onClick={(e) => {
                console.log(e)
                console.log(stop)
                // e.target.options.color = 'red'
                // this.refs.map.getLeafletElement().panTo(stopLatLng)
                browserHistory.push(`/feed/${this.props.feedSource.id}/edit/stop/${stop.stop_id}`)
              }}
            >
            </CircleMarker>
          )
          return marker
        })
        : null
      default:
        return null
    }
  }

  getBounds(component, entities) {
    switch (component) {
      // case 'route':
      //   return entities.map(route => {
      //     return (
      //       null
      //     )
      //   })
      // case 'stop':
      //   return entities.map(stop => {
      //     return (
      //       null
      //     )
      //   })
      default:
        return null
    }
  }

  render () {

    const { feedSource, feedInfo, activeComponent, entities, entity } = this.props
    if (!feedSource) return null
    // console.log(entities)
    //const summary = version.validationSummary
    // const bounds = this.getBounds(this.props.activeComponent, this.props.entities) || [[34, -87], [33, -86]]
    const offset = 0.005
    let bounds = [[feedSource.latestValidation.bounds.north + offset, feedSource.latestValidation.bounds.west - offset], [feedSource.latestValidation.bounds.south - offset, feedSource.latestValidation.bounds.east + offset]]
    let stop = entities && entities.find(stop => stop.stop_id === entity)
    if (entity && stop && activeComponent === 'stop' && !isNaN(stop.stop_lat) && !isNaN(stop.stop_lon)) {
      bounds = [[stop.stop_lat + offset, stop.stop_lon - offset], [stop.stop_lat - offset, stop.stop_lon + offset]]
    }
    const mapStyle = {
      height: '100%',
    }

    return (
      <Map
        ref='map'
        zoomControl={false}
        style={mapStyle}
        bounds={bounds}
        onClick={(e) => this.mapClicked(e)}
        scrollWheelZoom={true}
      >
        <ZoomControl position='topright' />
        <TileLayer
          url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}{retina}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          retina='@2x'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
          {this.getMapComponents(this.props.activeComponent, this.props.entities)}
      </Map>
    )
  }
}
