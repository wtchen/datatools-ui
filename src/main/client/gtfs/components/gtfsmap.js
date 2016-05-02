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

    if (nextProps.entities !== this.props.entities && this.refs.map) {
      this.refreshGtfsElements(nextProps.feeds, nextProps.entities)
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
      <Map
        ref='map'
        style={mapStyle}
        bounds={bounds}
        onLeafletZoomend={(e) => {
          this.props.onZoomChange(e)
          this.refs.map && this.refreshGtfsElements()
        }}
        onLeafletMoveend={() => this.refs.map && this.refreshGtfsElements()}
        onLeafletLayeradd={layerAddHandler}
        className='Gtfs-Map'
        >
        <TileLayer
          url='http://api.tiles.mapbox.com/v4/conveyal.ie3o67m0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29udmV5YWwiLCJhIjoiMDliQURXOCJ9.9JWPsqJY7dGIdX777An7Pw'
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
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
                key={pattern.pattern_id}
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
                    {this.props.onRouteClick
                      ? <Button href="#" onClick={() => this.props.onRouteClick(route, getFeed(this.props.feeds, route.feed_id))}>{this.props.popupAction} {route.route_id}</Button>
                      : <p>[Must add stops first]</p>
                    }

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
                  {this.props.onRouteClick
                    ? <Button href="#" onClick={() => this.props.onRouteClick(route, getFeed(this.props.feeds, route.feed_id))}>{this.props.popupAction} {route.route_id}</Button>
                    : <p>[Must add stops first]</p>
                  }
                </div>
              </Popup>
            )
            return (
              <GeoJson
                color={route.route_color !== null ? '#' + route.route_color : 'blue' }
                key={pattern.pattern_id}
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

  refreshGtfsElements (feeds, entities) {
    const feedIds = (feeds || this.props.feeds).map(getFeedId)
    const ents = (entities || this.props.entities || ['routes', 'stops'])
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


    let entitySearches = []
    if (ents.indexOf('stops') > -1){
      entitySearches.push(getStops)
    }
    else {
      entitySearches.push(null)
    }
    if (ents.indexOf('routes') > -1){
      entitySearches.push(getRoutes)
    }
    else {
      entitySearches.push(null)
    }
    Promise.all(entitySearches).then((results) => {
      console.log(results)
      const stops = results[0] ? results[0] : []
      const patterns = results[1] ? results[1] : []
      const routes = patterns.map(p => p.associatedRoutes[0])
      this.setState({ stops, patterns, routes })
    })
  }
}
