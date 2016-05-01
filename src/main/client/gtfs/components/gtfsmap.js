import React, { PropTypes } from 'react'

import fetch from 'isomorphic-fetch'

import { Button } from 'react-bootstrap'

import { Map, Marker, Popup, TileLayer, GeoJson, FeatureGroup, Polyline } from 'react-leaflet'

import { getFeed, getFeedId } from '../../common/util/modules'
import { getFeedsBounds } from '../../common/util/geo'

export default class GtfsMap extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      stops: null,
      routes: null,
      searchFocus: this.props.searchFocus,
      patterns: null,
      message: '',
      bounds: this.props.bounds || [[70, 130], [-70, -130]],
      map: {}
    }
  }

  componentDidMount () {
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.feeds.length !== this.props.feeds.length && this.refs.map) {
      this.refreshGtfsElements(nextProps.feeds)
    }

    // handle stop: panning to
    if (nextProps && nextProps.position !== this.props.position) {
      this.refs.map.getLeafletElement().panTo(nextProps.position)
    }
  }

  render () {
    const {attribution, centerCoordinates, geojson, markers, transitive, url, zoom} = this.props

    console.log('map props', this.props)

    var mapStyle = {
      height: '400px',
      width: '555px'
    }
    let bounds = getFeedsBounds(this.props.feeds)
    console.log(bounds)
    bounds = bounds && bounds.north ? [[bounds.north, bounds.east], [bounds.south, bounds.west]] : this.state.bounds

    const layerAddHandler = (e) => {
      // handle pattern: opening popup and fitting bounds
      if (e.layer.feature && e.layer.feature.properties.patternId) {
        this.refs.map.getLeafletElement().fitBounds(e.layer.getBounds())
        e.layer.openPopup()
      }
    }

    return (
    <div>
      <div>&nbsp;</div>
      <Map
        ref='map'
        style={mapStyle}
        bounds={bounds}
        onLeafletZoomend={() => this.refs.map && this.refreshGtfsElements()}
        onLeafletMoveend={() => this.refs.map && this.refreshGtfsElements()}
        onLeafletLayeradd={layerAddHandler}
        className='Gtfs-Map'
        >
        <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png' attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
        {this.props.stops ? this.props.stops.map((stop, index) => {
          if (stop) {
            return (
              <Marker
                ref={`marker-${stop.stop_id}`}
                onAdd={(e) => {
                  e.target.openPopup()
                }}
                position={[stop.stop_lat, stop.stop_lon]}
                key={`marker-${stop.stop_id}`}
                >
                <Popup>
                  <div>
                    <h3>{stop.stop_name}</h3>
                    <ul>
                      <li><strong>ID:</strong> {stop.stop_id}</li>
                      <li><strong>Agency:</strong> {getFeed(this.props.feeds, stop.feed_id).name}</li>
                      {stop.stop_desc && <li><strong>Desc:</strong> {stop.stop_desc}</li>}
                    </ul>
                    <Button href="#" onClick={() => this.props.onStopClick(stop, getFeed(this.props.feeds, stop.feed_id))}>{this.props.popupAction} {stop.stop_id}</Button>
                  </div>
                </Popup>
              </Marker>
            )
          }
        })
        : null
      }
        {this.state.stops ? this.state.stops.map((stop, index) => {
          if (stop) {
            return (
              <Marker
                position={[stop.stop_lat, stop.stop_lon]}
                key={`marker-${stop.stop_id}`}
                >
                <Popup>
                  <div>
                    <h3>{stop.stop_name}</h3>
                    <ul>
                      <li><strong>ID:</strong> {stop.stop_id}</li>
                      <li><strong>Agency:</strong> {getFeed(this.props.feeds, stop.feed_id).name}</li>
                      {stop.stop_desc && <li><strong>Desc:</strong> {stop.stop_desc}</li>}
                    </ul>
                    <Button href="#" onClick={() => this.props.onStopClick(stop, getFeed(this.props.feeds, stop.feed_id))}>{this.props.popupAction} {stop.stop_id}</Button>
                  </div>
                </Popup>
              </Marker>
            )
          }
        })
        : null
        }
        {this.state.patterns ? this.state.patterns.map((pattern, index) => {
          if (pattern) {
            const route = pattern.associatedRoutes[0]
            const routeName = route.route_short_name !== null ? route.route_short_name : route.route_long_name
            return (
              <GeoJson
                color={route.route_color !== null ? '#' + route.route_color : 'blue' }
                data={{type: 'LineString', coordinates: pattern.geometry.coordinates}}
              >
                <Popup>
                  <div>
                    <h3>{routeName}</h3>
                    <ul>
                      <li><strong>ID:</strong> {route.route_id}</li>
                      <li><strong>Agency:</strong> {getFeed(this.props.feeds, route.feed_id).name}</li>
                    </ul>
                    <Button href="#" onClick={() => this.props.onRouteClick(route, getFeed(this.props.feeds, route.feed_id))}>{this.props.popupAction} {route.route_id}</Button>
                  </div>
                </Popup>
              </GeoJson>
            )
          }
        })
        : null
      }
        {this.props.patterns ? this.props.patterns.map((pattern, index) => {
          if (pattern) {
            const route = pattern.associatedRoutes[0]
            const routeName = route.route_short_name !== null ? route.route_short_name : route.route_long_name
            const popup = (
              <Popup>
                <div>
                  <h3>{routeName}</h3>
                  <ul>
                    <li><strong>ID:</strong> {route.route_id}</li>
                    <li><strong>Agency:</strong> {getFeed(this.props.feeds, route.feed_id).name}</li>
                  </ul>
                  <Button href='#' onClick={() => this.props.onRouteClick(route, getFeed(this.props.feeds, route.feed_id))}>{this.props.popupAction} {route.route_id}</Button>
                </div>
              </Popup>
            )
            const geojson = (
              <GeoJson
                color={route.route_color !== null ? '#' + route.route_color : 'blue' }
                data={{type: 'LineString', coordinates: pattern.geometry.coordinates}}
                onEachFeature={(feature, layer) => {
                  layer.feature.properties.route = route
                  layer.feature.properties.patternId = pattern.pattern_id
                  // layer.feature.geometry.coordinates.push(pattern.geometry.coordinates)
                }}
                properties={route}
              >
                {popup}
              </GeoJson>
            )
            const polyline = (
              <Polyline
                color={route.route_color !== null ? '#' + route.route_color : 'blue' }
                style={{color: 'blue'}}
                positions={pattern.geometry.coordinates}
              >
                {popup}
              </Polyline>
            )
            return (
              <GeoJson
                color={route.route_color !== null ? '#' + route.route_color : 'blue' }
                data={{type: 'LineString', coordinates: pattern.geometry.coordinates}}
                onEachFeature={(feature, layer) => {
                  layer.feature.properties.route = route
                  layer.feature.properties.patternId = pattern.pattern_id
                  layer._leaflet_id = pattern.pattern_id
                  // layer.feature.geometry.coordinates.push(pattern.geometry.coordinates)
                }}
                properties={route}
              >
                {popup}
              </GeoJson>
            )
          }
        })
        : null
      }
      </Map>
    </div>
    )
  }

  refreshGtfsElements (feeds) {
    const feedIds = (feeds || this.props.feeds).map(getFeedId)
    const zoomLevel = this.refs.map.getLeafletElement().getZoom()
    if (feedIds.length === 0 || zoomLevel <= 13) {
      this.setState({ stops: [], patterns: [], routes: [] })
      return
    }
    console.log('refresh GTFS', feedIds)
    const bounds = this.refs['map'].getLeafletElement().getBounds()
    const maxLat = bounds.getNorth()
    const maxLng = bounds.getEast()
    const minLat = bounds.getSouth()
    const minLng = bounds.getWest()

    const getStops = fetch(`/api/manager/stops?max_lat=${maxLat}&max_lon=${maxLng}&min_lat=${minLat}&min_lon=${minLng}&feed=${feedIds.toString()}`)
      .then((response) => {
        return response.json()
      })

    const getRoutes = fetch(`/api/manager/routes?max_lat=${maxLat}&max_lon=${maxLng}&min_lat=${minLat}&min_lon=${minLng}&feed=${feedIds.toString()}`)
      .then((response) => {
        return response.json()
      })

    Promise.all([getStops, getRoutes]).then((results) => {
      const stops = results[0]
      const patterns = results[1]
      const routes = patterns.map(p => p.associatedRoutes[0])
      this.setState({ stops, patterns, routes })
    })
  }
}
