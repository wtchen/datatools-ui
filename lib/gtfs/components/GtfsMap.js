import React, { Component, PropTypes } from 'react'
import { shallowEqual } from 'react-pure-render'
import { Browser, latLngBounds } from 'leaflet'
import { Map, Marker, TileLayer, GeoJSON, FeatureGroup, Rectangle } from 'react-leaflet'

import { getFeedId } from '../../common/util/modules'
import PatternGeoJson from './PatternGeoJson'
import StopMarker from './StopMarker'
import { getFeedsBounds } from '../../common/util/geo'

export default class GtfsMap extends Component {
  static propTypes = {
    bounds: PropTypes.array,
    entities: PropTypes.array,
    feeds: PropTypes.array,
    height: PropTypes.number, // only px
    isochroneBand: PropTypes.number,
    newEntityId: PropTypes.number,
    onRouteClick: PropTypes.func,
    onStopClick: PropTypes.func,
    onZoomChange: PropTypes.func,
    pattern: PropTypes.object,
    patternFilter: PropTypes.string,
    patterns: PropTypes.array,
    popupAction: PropTypes.string,
    position: PropTypes.array,
    routes: PropTypes.array,
    searchFocus: PropTypes.string,
    showIsochrones: PropTypes.bool,
    showPatterns: PropTypes.bool,
    showStops: PropTypes.bool,
    stops: PropTypes.array,
    version: PropTypes.object,
    width: PropTypes.string // % or px
  }

  state = {
    bounds: this.props.bounds || [[70, 130], [-70, -130]],
    map: {}
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

  mapClicked = (e) => {
    if (this.props.showIsochrones) {
      this.fetchIsochrones(e.latlng)
    }
  }

  mapMoved = (e) => {
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

  /* Auto-zoom to newly-updated patterns or stops */
  componentDidUpdate (prevProps) {
    const { patterns, showPatterns, showStops, stops } = this.props
    if (showPatterns && prevProps.patterns !== patterns && patterns && patterns.length > 0) {
      let bounds = []
      patterns.forEach(ptn => {
        if (ptn.geometry && ptn.geometry.coordinates && ptn.geometry.coordinates.length > 0) {
          bounds = bounds.concat(ptn.geometry.coordinates.map(c => [c[1], c[0]]))
        }
      })
      this.props.updateMapState({ bounds })
    } else if (showStops && prevProps.stops !== stops && stops && stops.length > 0) {
      const bounds = latLngBounds(stops.map(stop => [stop.stop_lat, stop.stop_lon]))
      this.props.updateMapState({ bounds })
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

  // getIsochroneColor (time) {
  //   return time ? 'blue' : 'red'
  // }

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

  renderIsochrones (isochroneBand, version) {
    const comps = []
    const bandTime = isochroneBand || 60 * 60
    if (version && version.isochrones && version.isochrones.features) {
      version.isochrones.features.forEach((iso, index) => {
        if (iso.properties.time !== bandTime) return
        /* FIXME: Math.random() key */
        comps.push(
          <GeoJSON
            key={Math.random()}
            data={{type: 'MultiPolygon', coordinates: iso.geometry.coordinates}}
            color={'blue'}
            opacity={0} />
        )
      })
    }
    if (this.state && this.state.lastClicked) {
      comps.push(
        <Marker
          key='marker'
          position={this.state.lastClicked}
          draggable
          onDragEnd={this._onMarkerDragEnd} />
      )
    }
    if (comps.length === 1) {
      return comps[0]
    } else if (comps.length > 1) {
      return <FeatureGroup ref='isochrones'>{comps}</FeatureGroup>
    }
    return null
  }

  _onMarkerDragEnd = (e) => { this.fetchIsochrones(e.target.getLatLng()) }

  layerAddHandler = (e) => {
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
      disableScroll,
      feeds,
      height,
      isochroneBand,
      mapState,
      newEntityId,
      onRouteClick,
      onStopClick,
      pattern,
      patternFilter,
      patterns,
      popupAction,
      renderTransferPerformance,
      routes,
      showBounds,
      showIsochrones,
      showPatterns,
      showStops,
      sidebarExpanded,
      stop,
      stops,
      version,
      width
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

    // In view-stops mode, only show the current pattern
    const displayedPatterns = (patterns && showStops && patternFilter)
      ? patterns.filter(ptn => ptn.pattern_id === patternFilter)
      : patterns

    const MAPBOX_MAP_ID = process.env.MAPBOX_MAP_ID
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
    const MAPBOX_ATTRIBUTION = process.env.MAPBOX_ATTRIBUTION
    return (
      <div>
        <Map
          ref='map'
          style={mapStyle}
          bounds={mapState.bounds}
          zoom={mapState.zoom}
          scrollWheelZoom={!disableScroll}
          onClick={this.mapClicked}
          onMoveEnd={this.mapMoved}
          onLayerAdd={this.layerAddHandler}
          className='Gtfs-Map'>
          <TileLayer
            url={`https://api.tiles.mapbox.com/v4/${MAPBOX_MAP_ID}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${MAPBOX_ACCESS_TOKEN}`}
            attribution={MAPBOX_ATTRIBUTION} />
          {/* feed bounds */}
          {showBounds &&
            <Rectangle
              bounds={this.getBounds()}
              fillOpacity={0} />
          }

          {/* Stops from map bounds search */}
          {showStops && stops && stops.length && <FeatureGroup ref='stops'>
            {stops.map((s, index) => {
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
                  popupAction={popupAction}
                />
              )
            })}
          </FeatureGroup>}

          {/* Stop from GtfsSearch */}
          {stop && (
            <FeatureGroup>
              <StopMarker
                stop={stop}
                routes={routes}
                feeds={feeds}
                renderTransferPerformance={renderTransferPerformance}
                onStopClick={onStopClick}
                newEntityId={newEntityId}
                popupAction={popupAction}
              />
            </FeatureGroup>
          )}

          {/* Group of Patterns from search */}
          {showPatterns && displayedPatterns && displayedPatterns.length && (
            <FeatureGroup>
              {displayedPatterns.map((pattern, index) => (
                <PatternGeoJson
                  pattern={pattern}
                  key={pattern.pattern_id}
                  feeds={feeds}
                  index={index}
                  onRouteClick={onRouteClick}
                  newEntityId={newEntityId}
                  popupAction={popupAction} />
              ))}
            </FeatureGroup>
          )}

          {/* Single Pattern from GtfsSearch */}
          {pattern &&
            <FeatureGroup>
              <PatternGeoJson
                pattern={pattern}
                feeds={feeds}
                onRouteClick={onRouteClick}
                newEntityId={newEntityId}
                popupAction={popupAction} />
            </FeatureGroup>
          }

          {/* Isochrones from map click */}
          {showIsochrones && this.renderIsochrones(isochroneBand, version)}
        </Map>
      </div>
    )
  }
}
