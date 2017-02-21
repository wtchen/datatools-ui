import React, { Component, PropTypes } from 'react'
import { shallowEqual } from 'react-pure-render'
import { Browser } from 'leaflet'
import { Map, Marker, TileLayer, GeoJson, FeatureGroup, Rectangle } from 'react-leaflet'

import { getFeedId } from '../../common/util/modules'
import PatternGeoJson from './PatternGeoJson'
import StopMarker from './StopMarker'
import { getFeedsBounds } from '../../common/util/geo'
import { getConfigProperty } from '../../common/util/config'

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
    const bounds = this.refs.map && this.refs.map.leafletElement.getBounds()
    const zoom = this.refs.map && this.refs.map.leafletElement.getBoundsZoom(bounds)
    this.props.updateMapState && this.props.updateMapState({bounds, zoom})
    this.refs.map && !this.props.disableRefresh && this.refreshGtfsElements()
  }
  componentWillReceiveProps (nextProps) {
    if (!this.props.disableRefresh) {
      // refresh elements if feeds change
      if (nextProps.feeds.length !== this.props.feeds.length && this.refs.map) {
        this.refreshGtfsElements(nextProps.feeds)
      }
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
    } else if (this.props.version) {
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
                color: this.getIsochroneColor(iso.properties.time)
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
    const {
      width,
      height,
      disableScroll,
      showBounds,
      stops,
      routes,
      feeds,
      renderTransferPerformance,
      onStopClick,
      newEntityId,
      popupAction,
      stop,
      patterns,
      onRouteClick,
      pattern,
      showIsochrones,
      sidebarExpanded
    } = this.props
    let mapWidth = width
    if (width.indexOf('px') !== -1) {
      const diff = sidebarExpanded ? 30 : 0
      mapWidth = `${width.split('px')[0] - diff}px`
    }
    var mapStyle = {
      width: mapWidth, // % or px
      height: `${height}px` // only px
    }
    return (
      <div>
        <Map
          ref='map'
          style={mapStyle}
          bounds={this.getBounds()}
          scrollWheelZoom={!disableScroll}
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
          {showBounds &&
            <Rectangle
              bounds={this.getBounds()}
              fillOpacity={0}
            />
          }
          <FeatureGroup ref='stops'>
            {/* Stops from map bounds search */}
            {stops && stops.length
              ? stops.map((s, index) => {
                if (!s) return null
                return (
                  <StopMarker
                    stop={s}
                    routes={routes}
                    key={`marker-${s.stop_id}`}
                    feeds={feeds}
                    renderTransferPerformance={renderTransferPerformance}
                    onStopClick={onStopClick}
                    newEntityId={newEntityId}
                    popupAction={popupAction} />
                )
              })
              : null
            }
            {/* Stop from GtfsSearch */}
            {stop && <StopMarker
              stop={stop}
              routes={routes}
              feeds={feeds}
              renderTransferPerformance={renderTransferPerformance}
              onStopClick={onStopClick}
              newEntityId={newEntityId}
              popupAction={popupAction}
            />}
          </FeatureGroup>
          <FeatureGroup ref='patterns'>
            {/* Patterns from map bounds search */}
            {patterns
              ? patterns.map((pattern, index) => (
                <PatternGeoJson
                  pattern={pattern}
                  key={pattern.pattern_id}
                  feeds={feeds}
                  index={index}
                  onRouteClick={onRouteClick}
                  newEntityId={newEntityId}
                  popupAction={popupAction} />
              ))
              : null
            }
            {/* Pattern from GtfsSearch */}
            {pattern &&
              <PatternGeoJson
                pattern={pattern}
                feeds={feeds}
                onRouteClick={onRouteClick}
                newEntityId={newEntityId}
                popupAction={popupAction} />
            }
          </FeatureGroup>
          <FeatureGroup ref='isochrones'>
            {/* Isochrones from map click */}
            {showIsochrones && this.renderIsochrones()}
          </FeatureGroup>
        </Map>
      </div>
    )
  }
}
