import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import { Button, FormControl, ControlLabel } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import { divIcon, Browser } from 'leaflet'
import { Map, Marker, Popup, TileLayer, GeoJson, FeatureGroup, Rectangle } from 'react-leaflet'

import { getFeed, getFeedId } from '../../common/util/modules'
import { getFeedsBounds } from '../../common/util/geo'
import { getConfigProperty } from '../../common/util/config'

const colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']

export default class GtfsMap extends Component {
  static propTypes = {
    searchFocus: PropTypes.bool,
    bounds: PropTypes.array,
    feeds: PropTypes.array,
    version: PropTypes.object,

    onStopClick: PropTypes.func,
    onRouteClick: PropTypes.func,
    onZoomChange: PropTypes.func,
    popupAction: PropTypes.func,
    newEntityId: PropTypes.string,

    entities: PropTypes.array,
    position: PropTypes.array,
    stops: PropTypes.array,
    patterns: PropTypes.array,
    routes: PropTypes.array,

    width: PropTypes.string, // % or px
    height: PropTypes.number // only px
  }
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
    console.log('map mount')
    this.resetMap()
  }
  resetMap () {
    setTimeout(() => {
      this.refs.map.leafletElement.invalidateSize()
      // this.refs.map.leafletElement.fitBounds(this.getBounds())
    }, 500)
  }
  mapClicked (e) {
    if (this.props.showIsochrones) {
      this.fetchIsochrones(e.latlng)
    }
  }
  componentWillReceiveProps (nextProps) {
    if (!this.props.disableRefresh) {
      if (nextProps.feeds.length !== this.props.feeds.length && this.refs.map) {
        this.refreshGtfsElements(nextProps.feeds)
      }

      if (nextProps.entities !== this.props.entities && this.refs.map) {
        this.refreshGtfsElements(nextProps.feeds, nextProps.entities)
      }
    }

    // handle stop: panning to
    if (nextProps && nextProps.position !== this.props.position) {
      this.refs.map.leafletElement.panTo(nextProps.position)
    }

    if (nextProps.height !== this.props.height || nextProps.width !== this.props.width) {
      this.resetMap()
    }

    // recalculate isochrone if date/time changes
    if (!shallowEqual(nextProps.dateTime, this.props.dateTime)) {
      this.state.lastClicked && this.props.showIsochrones && this.fetchIsochrones(this.state.lastClicked)
    }
  }
  getBounds () {
    let bounds
    if (this.props.feeds) {
      bounds = getFeedsBounds(this.props.feeds)
    }
    else if (this.props.version) {
      bounds = this.props.version.validationSummary.bounds
    }
    bounds = bounds && bounds.north ? [[bounds.north, bounds.east], [bounds.south, bounds.west]] : this.state.bounds
    return bounds
  }
  fetchIsochrones (latlng) {
    const center = this.refs.map.leafletElement.getCenter()
    this.props.fetchIsochrones(this.props.version, latlng.lat, latlng.lng, center.lat, center.lng)
    this.setState({ lastClicked: latlng })
  }
  getIsochroneColor (time) {
    return time ? 'blue' : 'red'
  }
  renderTransferPerformance (transferPerformance) {
    console.log(transferPerformance)
    if (!transferPerformance)
      return <p>No transfers found</p>
    return (
    <ul className='list-unstyled' style={{marginTop: '5px'}}>
      <li><strong>Typical case: {moment.duration(transferPerformance.typicalCase, 'seconds').humanize()}</strong></li>
      <li>Best case: {moment.duration(transferPerformance.bestCase, 'seconds').humanize()}</li>
      <li>Worst case: {moment.duration(transferPerformance.worstCase, 'seconds').humanize()}</li>
    </ul>)
  }
  renderIsochrones () {
    let comps = []
    const bandTime = this.props.isochroneBand || 60 * 60
    if (this.props.version && this.props.version.isochrones) {
      comps = this.props.version.isochrones.features.map((iso, index) => {
        if (iso.properties.time !== bandTime) return null
        return (
          <GeoJson
            key={Math.random()}
            data={{type: 'MultiPolygon', coordinates: iso.geometry.coordinates}}
            color={'blue'}
            opacity={0}
            style={(feature) => {
              return {
                color: this.getIsochroneColor(iso.properties.time),
              }
            }}
          />
        )
      })
    }

    if(this.state && this.state.lastClicked) {
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
  render () {
    console.log(this.props, this.state)
    var mapStyle = {
      width: this.props.width, // % or px
      height: `${this.props.height}px` // only px
    }
    let bounds = this.getBounds()
    const layerAddHandler = (e) => {
      // handle pattern: opening popup and fitting bounds
      if (e.layer.feature && e.layer.feature.properties.patternId) {
        this.refs.map.leafletElement.fitBounds(e.layer.getBounds())
        if (!this.props.disablePopup) {
          e.layer.openPopup()
        }
      }
    }
    return (
    <div>
      <Map
        ref='map'
        style={mapStyle}
        bounds={bounds}
        scrollWheelZoom={!this.props.disableScroll}
        onClick={(e) => this.mapClicked(e)}
        // onZoomEnd={(e) => {
        //   this.props.onZoomChange && this.props.onZoomChange(e)
        //   this.refs.map && !this.props.disableRefresh && this.refreshGtfsElements()
        // }}
        // onMoveEnd={() => this.refs.map && !this.props.disableRefresh && this.refreshGtfsElements()}
        onLayerAdd={layerAddHandler}
        className='Gtfs-Map'
      >
        <TileLayer
          url={`https://api.tiles.mapbox.com/v4/${getConfigProperty('mapbox.map_id')}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${getConfigProperty('mapbox.access_token')}`}
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
        {this.props.showBounds
          ? <Rectangle
              bounds={bounds}
              fillOpacity={0}
            />
          : null
        }
        <FeatureGroup>
        {this.props.stops ? this.props.stops.map((stop, index) => {
          if (stop) {
            const busIcon = divIcon({
              html: `<span title="${stop.stop_name}" class="fa-stack bus-stop-icon" style="opacity: 0.6">
                      <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
                      <i class="fa fa-bus fa-stack-1x" style="color: #000000"></i>
                    </span>`,
              className: '',
              iconSize: [24, 24],
            })
            return (
              <Marker
                ref={`marker-${stop.stop_id}`}
                icon={busIcon}
                // onAdd={(e) => {
                //   e.target.openPopup()
                // }}
                position={[stop.stop_lat, stop.stop_lon]}
                key={`marker-${stop.stop_id}`}
                >
                <Popup>
                  <div>
                    <p><strong>{stop.stop_name} ({stop.stop_id})</strong></p>
                    {stop.transferPerformance && stop.transferPerformance.length
                      ? <div>
                          <ControlLabel>Transfer performance</ControlLabel>
                          <FormControl
                            componentClass='select'
                            defaultValue={0}
                            onChange={(evt) => {
                              let state = {}
                              state[stop.stop_id] = +evt.target.value
                              this.setState(state)}
                            }
                          >
                            {stop.transferPerformance
                              // .sort((a, b) => {
                              //
                              // })
                              .map((summary, index) => {
                                const fromRoute = this.props.routes.find(r => r.route_id === summary.fromRoute)
                                const toRoute = this.props.routes.find(r => r.route_id === summary.toRoute)
                                return <option value={index}>{fromRoute.route_short_name} to {toRoute.route_short_name}</option>
                              })
                            }
                          </FormControl>
                          {this.renderTransferPerformance(stop.transferPerformance[this.state[stop.stop_id] || 0])}
                        </div>
                      : <p>No transfers found</p>
                    }
                    {this.props.onStopClick
                      ? <Button href='#' onClick={() => this.props.onStopClick(stop, getFeed(this.props.feeds, stop.feed_id), this.props.newEntityId)}>
                          {this.props.popupAction} {stop.stop_id}
                        </Button>
                      : null
                    }
                  </div>
                </Popup>
              </Marker>
            )
          }
        })
        : null
      }
      </FeatureGroup>
      <FeatureGroup>
        {this.props.patterns ? this.props.patterns.map((pattern, index) => {
          if (pattern) {
//            console.log(pattern)
            const route = this.props.routes.find(r => r.route_id === pattern.route_id)
            const routeName = route.route_short_name !== null ? route.route_short_name : route.route_long_name
            const popup = (
              <Popup>
                <div>
                  <p>
                  <strong>
                  {
                    pattern.name // routeName
                  }
                  </strong>
                  </p>
                  <ul>
                    <li><strong>ID:</strong> {route.route_id}</li>
                    <li><strong>Agency:</strong>{' '}
                    {// TODO: change this back to feedName
                      route.feed_id
                      // getFeed(this.props.feeds, route.feed_id).name
                    }
                    </li>
                  </ul>
                  {this.props.onRouteClick
                    ? <Button href='#' onClick={() => this.props.onRouteClick(route, getFeed(this.props.feeds, route.feed_id), this.props.newEntityId)}>{this.props.popupAction} {route.route_id}</Button>
                    : <p>[Must add stops first]</p>
                  }
                </div>
              </Popup>
            )
            return (
              <GeoJson
                color={colors[index % (colors.length - 1)]}
                key={pattern.pattern_id}
                data={pattern.geometry}
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
      </FeatureGroup>
      {this.props.showIsochrones && this.renderIsochrones()}
      </Map>
    </div>
    )
  }

  refreshGtfsElements (feeds, entities) {
    const feedIds = (feeds || this.props.feeds).map(getFeedId)
    const ents = (entities || this.props.entities || ['routes', 'stops'])
    const zoomLevel = this.refs.map.leafletElement.getZoom()
    if (feedIds.length === 0 || zoomLevel <= 13) {
      this.setState({ stops: [], patterns: [], routes: [] })
      return
    }
    console.log('refresh GTFS', feedIds)
    const bounds = this.refs['map'].leafletElement.getBounds()
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
    if (ents.indexOf('stops') > -1) {
      entitySearches.push(getStops)
    } else {
      entitySearches.push(null)
    }
    if (ents.indexOf('routes') > -1) {
      entitySearches.push(getRoutes)
    } else {
      entitySearches.push(null)
    }
    Promise.all(entitySearches).then((results) => {
      const stops = results[0] ? results[0] : []
      const patterns = results[1] ? results[1] : []
      const routes = patterns.map(p => p.associatedRoutes[0])
      this.setState({ stops, patterns, routes })
    })
  }
}
