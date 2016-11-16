import React, { Component, PropTypes } from 'react'
import fetch from 'isomorphic-fetch'
import moment from 'moment'
import { Button, FormControl, ControlLabel } from 'react-bootstrap'
import { shallowEqual } from 'react-pure-render'
import { divIcon, Browser } from 'leaflet'
import { Map, Marker, Popup, TileLayer, GeoJson, FeatureGroup, Rectangle } from 'react-leaflet'
import {Icon} from '@conveyal/woonerf'

import { getFeed, getFeedId } from '../../common/util/modules'
import { getFeedsBounds } from '../../common/util/geo'
import { getRouteName } from '../../editor/util/gtfs'
import { getConfigProperty } from '../../common/util/config'

const colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']

export default class GtfsMap extends Component {
  static propTypes = {
    searchFocus: PropTypes.string,
    bounds: PropTypes.array,
    feeds: PropTypes.array,
    version: PropTypes.object,

    onStopClick: PropTypes.func,
    onRouteClick: PropTypes.func,
    onZoomChange: PropTypes.func,
    popupAction: PropTypes.string,
    newEntityId: PropTypes.number,

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
      bounds: this.props.bounds || [[70, 130], [-70, -130]],
      map: {}
    }
  }

  componentDidMount () {
    this.resetMap(true)
  }
  resetMap (resetBounds = false) {
    setTimeout(() => {
      this.refs.map.leafletElement.invalidateSize()
      resetBounds && this.refs.map.leafletElement.fitBounds(this.getBounds())
    }, 500)
  }
  mapClicked (e) {
    if (this.props.showIsochrones) {
      this.fetchIsochrones(e.latlng)
    }
  }
  mapMoved (e) {
    let bounds = this.refs.map && this.refs.map.leafletElement.getBounds()
    let zoom = this.refs.map && this.refs.map.leafletElement.getBoundsZoom(bounds)
    this.props.updateMapState && this.props.updateMapState({bounds, zoom})
    this.refs.map && !this.props.disableRefresh && this.refreshGtfsElements()
  }
  componentWillReceiveProps (nextProps) {
    if (!this.props.disableRefresh) {
      // refresh elements if feeds change
      if (nextProps.feeds.length !== this.props.feeds.length && this.refs.map) {
        this.refreshGtfsElements(nextProps.feeds)
      }
      //
      if (nextProps.entities !== this.props.entities && this.refs.map) {
        this.refreshGtfsElements(nextProps.feeds, nextProps.entities)
      }
    }

    if (nextProps.searchFocus && nextProps.searchFocus !== this.props.searchFocus) {
      this.setState({searchFocus: nextProps.searchFocus})
    }

    // handle stop: panning on stop select
    // pattern panTo is handled with layerAddHandler and searchFocus
    if (nextProps.stop && !shallowEqual(nextProps.stop, this.props.stop)) {
      this.refs.map.leafletElement.panTo([nextProps.stop.stop_lat, nextProps.stop.stop_lon])
    }

    // if height or width changes, reset map
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
  renderTransferPerformance (stop) {
    return stop.transferPerformance && stop.transferPerformance.length
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
          {this.renderTransferPerformanceResult(stop.transferPerformance[this.state[stop.stop_id] || 0])}
        </div>
      : <p>No transfers found</p>
  }
  renderTransferPerformanceResult (transferPerformance) {
    if (!transferPerformance)
      return <p>No transfers found</p>
    return (
    <ul className='list-unstyled' style={{marginTop: '5px'}}>
      <li><strong>Typical case: {moment.duration(transferPerformance.typicalCase, 'seconds').humanize()}</strong></li>
      <li>Best case: {moment.duration(transferPerformance.bestCase, 'seconds').humanize()}</li>
      <li>Worst case: {moment.duration(transferPerformance.worstCase, 'seconds').humanize()}</li>
    </ul>)
  }
  renderStop (stop, index) {
    if (!stop) {
      return null
    }
    const feedId = stop.feed_id || stop.feed && stop.feed.feed_id
    const feed = getFeed(this.props.feeds, feedId)
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
            <p><Icon type='map-marker'/> <strong>{stop.stop_name} ({stop.stop_id})</strong></p>
            {this.props.renderTransferPerformance && this.renderTransferPerformance(stop)}
            {this.props.onStopClick
              ? <Button
                  bsStyle='primary'
                  block
                  onClick={() => this.props.onStopClick(stop, feed, this.props.newEntityId)}
                >
                  <Icon type='map-marker'/> {this.props.popupAction} stop
                </Button>
              : null
            }
          </div>
        </Popup>
      </Marker>
    )
  }
  renderPattern (pattern, index = 0) {
    if (!pattern) {
      return null
    }
    const route = pattern.route
    const feedId = route ? route.feed_id || route.feed.feed_id : null
    const feed = getFeed(this.props.feeds, feedId)
    const routeName = route ? getRouteName(route) : pattern.route_name
    const routeId = route ? route.route_id : pattern.route_id
    const popup = (
      <Popup>
        <div>
          <p><Icon type='bus'/> <strong>{routeName}</strong></p>
          <p><Icon type='bus'/> <strong>{getRouteName(route)}</strong></p>
          <ul>
            <li><strong>ID:</strong> {routeId}</li>
            <li><strong>Agency:</strong>{' '}
            {// TODO: change this back to feedName
              // route.feed_id
              feed && feed.name
            }
            </li>
          </ul>
          {this.props.onRouteClick
            ? <Button
                bsStyle='primary'
                block
                onClick={() => this.props.onRouteClick(route, feed, this.props.newEntityId)}
              >
                <Icon type='bus'/> {this.props.popupAction} route
              </Button>
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
          layer.feature.properties.patternId = pattern.pattern_id
          layer._leaflet_id = pattern.pattern_id
        }}
      >
        {popup}
      </GeoJson>
    )
  }
  renderIsochrones () {
    let comps = []
    const bandTime = this.props.isochroneBand || 60 * 60
    if (this.props.version && this.props.version.isochrones && this.props.version.isochrones.features) {
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
  layerAddHandler (e) {
    // handle pattern panTo and popup open
    const patternId = e.layer.feature && e.layer.feature.properties.patternId
    if (patternId && patternId === this.props.searchFocus) {
      this.refs.map && this.refs.map.leafletElement.fitBounds(e.layer.getBounds())
      e.layer.openPopup && e.layer.openPopup()
      this.setState({searchFocus: null})
    }
    // open popup for stop or pattern if searchFocus is set
    if (this.props.stop && this.state.searchFocus === this.props.stop.stop_id) {
      e.layer.openPopup && e.layer.openPopup()
      this.setState({searchFocus: null})
    }
  }
  render () {
    var mapStyle = {
      width: this.props.width, // % or px
      height: `${this.props.height}px` // only px
    }
    let bounds = this.getBounds()
    return (
    <div>
      <Map
        ref='map'
        style={mapStyle}
        bounds={bounds}
        scrollWheelZoom={!this.props.disableScroll}
        onClick={(e) => this.mapClicked(e)}
        onMoveEnd={(e) => this.mapMoved(e)}
        onLayerAdd={(e) => this.layerAddHandler(e)}
        className='Gtfs-Map'
      >
        <TileLayer
          url={`https://api.tiles.mapbox.com/v4/${getConfigProperty('mapbox.map_id')}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${getConfigProperty('mapbox.access_token')}`}
          attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'
        />
        {/* feed bounds */}
        {this.props.showBounds
          ? <Rectangle
              bounds={bounds}
              fillOpacity={0}
            />
          : null
        }
        <FeatureGroup ref='stops'>
          {/* Stops from map bounds search */}
          {this.props.stops
            ? this.props.stops.map((stop, index) => this.renderStop(stop, index))
            : null
          }
          {/* Stop from GtfsSearch */}
          {this.renderStop(this.props.stop)}
        </FeatureGroup>
      <FeatureGroup ref='patterns'>
        {/* Patterns from map bounds search */}
        {this.props.patterns
          ? this.props.patterns.map((pattern, index) => this.renderPattern(pattern, index))
          : null
        }
        {/* Pattern from GtfsSearch */}
        {this.renderPattern(this.props.pattern)}
      </FeatureGroup>
      <FeatureGroup ref='isochrones'>
        {/* Isochrones from map click */}
        {this.props.showIsochrones && this.renderIsochrones()}
      </FeatureGroup>
      </Map>
    </div>
    )
  }

  refreshGtfsElements (feeds, entities) {
    const zoomLevel = this.refs.map.leafletElement.getZoom()
    const feedIds = (feeds || this.props.feeds).map(getFeedId)
    const ents = (entities || this.props.entities || ['routes', 'stops'])
    if (feedIds.length === 0 || zoomLevel <= 13) {
      // this.props.clearGtfsElements()
    } else {
      this.props.refreshGtfsElements(feedIds, ents)
    }
  }
}
