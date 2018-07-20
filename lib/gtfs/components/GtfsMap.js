// @flow

import React, { Component } from 'react'
import { shallowEqual } from 'react-pure-render'
import { Browser, latLngBounds } from 'leaflet'
import { FeatureGroup, GeoJSON, Map, Marker, Polyline, Rectangle, TileLayer } from 'react-leaflet'

import PatternGeoJson from './PatternGeoJson'
import StopMarker from './StopMarker'
import { getFeedsBounds, convertToArrayBounds } from '../../common/util/geo'

import type {Feed} from '../../types'

type Props = {
  bounds: Array<Array<number>>,
  dateTime: any,
  disableRefresh: boolean,
  disableScroll: any,
  entities: Array<string>,
  feeds: Array<Feed>,
  fetchIsochrones: Function,
  height: number, // only px
  isochroneBand: number,
  mapState: any,
  newEntityId: number,
  onRouteClick: (any) => void,
  onStopClick: (any) => void,
  onZoomChange: (any) => void,
  pattern: any,
  patternFilter: string,
  patterns: Array<any>,
  popupAction: string,
  position: Array<any>,
  refreshGtfsElements: Function,
  renderTransferPerformance: Function,
  routes: Array<any>,
  searchFocus: string,
  shapes: {data: Array<any>},
  showAllRoutesOnMap: boolean,
  showBounds: any,
  showIsochrones: boolean,
  showPatterns: boolean,
  showStops: boolean,
  sidebarExpanded: any,
  stop: any,
  stops: Array<any>,
  updateMapState: (any) => void,
  version: any,
  width: string // % or px
}

type State = {
  bounds: any,
  lastClicked?: any,
  map: any,
  searchFocus?: any
}

const DEFAULT_BOUNDS = [[70, 130], [-70, -130]]

export default class GtfsMap extends Component<Props, State> {
  state = {
    bounds: this.props.bounds || DEFAULT_BOUNDS,
    map: {},
    searchFocus: null
  }

  static defaultProps = {
    entities: []
  }

  componentDidMount () {
    this.resetMap(true)
  }

  resetMap (resetBounds: boolean = false) {
    setTimeout(() => {
      const {map} = this.refs
      if (map) {
        map.leafletElement.invalidateSize()
        const bounds = this._getVersionBounds()
        console.log('setting bounds', bounds)
        resetBounds && map.leafletElement.fitBounds(bounds)
      }
    }, 500)
  }

  mapClicked = (e: any) => {
    if (this.props.showIsochrones) {
      this.fetchIsochrones(e.latlng)
    }
  }

  mapMoved = (e: any) => {
    const {map} = this.refs
    const {disableRefresh, updateMapState} = this.props
    const bounds = map && map.leafletElement.getBounds()
    const zoom = map && map.leafletElement.getBoundsZoom(bounds)
    updateMapState && updateMapState({bounds, zoom})
    map && !disableRefresh && this.refreshGtfsElements()
  }

  componentWillReceiveProps (nextProps: Props) {
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
  componentDidUpdate (prevProps: Props) {
    const { patterns, showPatterns, showStops, stops } = this.props
    if (showPatterns && prevProps.patterns !== patterns && patterns && patterns.length > 0) {
      // Set bounds to visible patterns.
      let bounds = []
      patterns.forEach(ptn => {
        if (ptn.geometry && ptn.geometry.coordinates && ptn.geometry.coordinates.length > 0) {
          bounds = bounds.concat(ptn.geometry.coordinates.map(c => [c[1], c[0]]))
        }
      })
      bounds = latLngBounds(bounds)
      if (bounds.isValid()) return this.props.updateMapState({ bounds })
      else console.warn(`Pattern bounds are invalid`, bounds)
    }
    if (showStops && prevProps.stops !== stops && stops && stops.length > 0) {
      // If not showing patterns (or bounds are invalid), try setting bounds to
      // visible stops.
      const bounds = latLngBounds(stops.map(stop => [stop.stop_lat, stop.stop_lon]))
      if (bounds.isValid()) return this.props.updateMapState({ bounds })
      else console.warn(`Stops bounds are invalid`, bounds)
    }
  }

  _boundsAreValid = (bounds: any): boolean => bounds && bounds.north && !isNaN(bounds.north)

  _getVersionBounds () {
    const {version} = this.props
    if (version && version.validationSummary.bounds) {
      const bounds = version.validationSummary.bounds
      if (this._boundsAreValid(bounds)) return convertToArrayBounds(bounds)
    }
    return this.state.bounds
  }

  fetchIsochrones (latlng: any) {
    const center = this.refs.map.leafletElement.getCenter()
    this.props.fetchIsochrones(this.props.version, latlng.lat, latlng.lng, center.lat, center.lng)
    this.setState({ lastClicked: latlng })
  }

  refreshGtfsElements (feeds: any, entities: any) {
    const zoomLevel = this.refs.map.leafletElement.getZoom()
    // const feedIds = (feeds || this.props.feeds).map(getFeedId)
    const feedsToSearch = feeds || this.props.feeds
    const ents = entities || this.props.entities
    if (feedsToSearch.length === 0 || zoomLevel > 13) {
      this.props.refreshGtfsElements(feedsToSearch, ents)
    } else {
      // this.props.clearGtfsElements()
    }
  }

  renderIsochrones (isochroneBand: any, version: any) {
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

  _onMarkerDragEnd = (e: any) => { this.fetchIsochrones(e.target.getLatLng()) }

  layerAddHandler = (e: any) => {
    const {stop, pattern} = this.props
    const {searchFocus} = this.state
    // handle pattern panTo and popup open
    if (pattern && pattern.pattern_id === searchFocus) {
      // Wait to call open pop up to ensure that layer has fully materialized
      window.setTimeout(() => {
        if (e.layer.getBounds && this.refs.map) {
          // Fit bounds to polyline if function exists
          this.refs.map.leafletElement.fitBounds(e.layer.getBounds())
        }
        // Open popup for pattern if added via a selection from the search
        e.layer.openPopup && e.layer.openPopup()
      }, 100)
      this.setState({searchFocus: null})
    }
    if (stop && searchFocus === stop.stop_id) {
      // Open popup for stop if added via a selection from the search
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
      shapes,
      showAllRoutesOnMap,
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
      mapWidth = `${parseInt(width.split('px')[0], 10) - diff}px`
    }
    const mapStyle = {
      width: mapWidth, // % or px
      height: `${height}px` // only px
    }

    // In view-stops mode, only show the current pattern
    const displayedPatterns = (patterns && showStops && patternFilter)
      ? patterns.filter(ptn => ptn.pattern_id === patternFilter)
      : patterns

    // set as empty string if environment variable doesn't exist to make flow happy
    const MAPBOX_MAP_ID = process.env.MAPBOX_MAP_ID || ''
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || ''
    const MAPBOX_ATTRIBUTION = process.env.MAPBOX_ATTRIBUTION || ''
    const versionBoundingBox = this._getVersionBounds()
    const feedsBounds = feeds && feeds.length > 0 && convertToArrayBounds(getFeedsBounds(feeds))
    return (
      <Map
        ref='map'
        style={mapStyle}
        bounds={feedsBounds || mapState.bounds}
        zoom={mapState.zoom}
        scrollWheelZoom={!disableScroll}
        onClick={this.mapClicked}
        onMoveEnd={this.mapMoved}
        onLayerAdd={this.layerAddHandler}
        className='Gtfs-Map'>
        <TileLayer
          url={`https://api.tiles.mapbox.com/v4/${MAPBOX_MAP_ID}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${MAPBOX_ACCESS_TOKEN}`}
          attribution={MAPBOX_ATTRIBUTION} />
        {/* Feed version bounding box (show if not set to default indicating invalid version bounds) */}
        {showBounds && versionBoundingBox !== DEFAULT_BOUNDS &&
          <Rectangle
            bounds={versionBoundingBox}
            fillOpacity={0} />
        }

        {/* Stops from map bounds search */}
        {(showStops || this.props.entities.indexOf('stops') !== -1) && stops && stops.length && <FeatureGroup ref='stops'>
          {stops.map((s, index) => {
            if (!s) return null
            return (
              <StopMarker
                stop={s}
                routes={routes}
                key={`marker-${s.stop_id}`}
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
              renderTransferPerformance={renderTransferPerformance}
              onStopClick={onStopClick}
              newEntityId={newEntityId}
              popupAction={popupAction}
            />
          </FeatureGroup>
        )}
        {/* Patterns from map bounds search */}
        {patterns && !version
          ? patterns.map((pattern, index) => (
            <PatternGeoJson
              pattern={pattern}
              key={`${pattern.feed.id}-${pattern.pattern_id}`}
              index={index}
              onRouteClick={onRouteClick}
              newEntityId={newEntityId}
              popupAction={popupAction} />
          ))
          : null
        }
        {/* Group of Patterns from search */}
        {showPatterns && displayedPatterns && displayedPatterns.length && (
          <FeatureGroup>
            {displayedPatterns.map((pattern, index) => (
              <PatternGeoJson
                pattern={pattern}
                key={pattern.pattern_id}
                index={index}
                onRouteClick={onRouteClick}
                newEntityId={newEntityId}
                popupAction={popupAction} />
            ))}
          </FeatureGroup>
        )}
        {/* Pattern from GtfsSearch */}
        {pattern &&
          <PatternGeoJson
            key={`${pattern.feed.id}-${pattern.pattern_id}`}
            pattern={pattern}
            onRouteClick={onRouteClick}
            newEntityId={newEntityId}
            popupAction={popupAction} />
        }
        {/* Isochrones from map click */}
        {showIsochrones && this.renderIsochrones(isochroneBand, version)}

        {/* Display all route patterns */}
        {showAllRoutesOnMap &&
          shapes.data.map((shape, index) =>
            <Polyline
              color='#556c7f'
              key={index}
              weight={2}
              positions={shape} />
          )}
      </Map>
    )
  }
}
