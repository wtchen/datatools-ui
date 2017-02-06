import React, { Component } from 'react'
import { Map, ZoomControl, GeoJson, FeatureGroup } from 'react-leaflet'
import { shallowEqual } from 'react-pure-render'

import EditorMapLayersControl from './EditorMapLayersControl'
import AddableStopsLayer from './AddableStopsLayer'
import PatternStopsLayer from './PatternStopsLayer'
import DirectionIconsLayer from './DirectionIconsLayer'
import ControlPointsLayer from './ControlPointsLayer'
// import StopMarkersLayer from './StopMarkersLayer'
import StopsLayer from './StopsLayer'
import EditorMapProps from '../../props'
import PatternsLayer from './PatternsLayer'
import { MAP_LAYERS, constructStop, clickToLatLng, getFeedBounds } from '../../util/map'

export default class EditorMap extends Component {
  static propTypes = EditorMapProps
  constructor (props) {
    super(props)
    this.state = {}
  }
  _onResize = () => {
    this.setState({width: window.innerWidth, height: window.innerHeight})
    this.refs.map && setTimeout(() => this.refs.map.leafletElement.invalidateSize(), 500)
  }
  componentWillMount () {
    this._onResize()
    this.setState({willMount: true})
  }
  componentDidMount () {
    window.addEventListener('resize', this._onResize)
    this.setState({willMount: false})
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.offset !== this.props.offset || nextProps.hidden !== this.props.hidden) {
      this._onResize()
    }
    // if (nextProps.editSettings.controlPoints && nextProps.editSettings.controlPoints.length && !shallowEqual(nextProps.editSettings.controlPoints, this.props.editSettings.controlPoints)) {
    //   this.setState({controlPoints: nextProps.editSettings.controlPoints[nextProps.editSettings.controlPoints.length - 1]})
    // }
    if (nextProps.zoomToTarget && !shallowEqual(nextProps.zoomToTarget, this.props.zoomToTarget)) {
      // this._onResize()
      this.setState({zoomToTarget: true})
    }
  }
  shouldComponentUpdate (nextProps, nextState) {
    // don't bother updating if component is hidden
    if (nextProps.hidden && this.props.hidden === nextProps.hidden) {
      return false
    }
    // TODO: clean up this mess
    const shouldUpdate =
            !shallowEqual(nextState, this.state) ||
            this.props.hidden !== nextProps.hidden ||
            !shallowEqual(nextProps.mapState.routesGeojson, this.props.mapState.routesGeojson) ||
            (nextProps.activeComponent === 'stop' || nextProps.activeComponent === 'route') && nextProps.activeEntityId !== this.props.activeEntityId ||
            nextProps.activeEntity && this.props.activeEntity && nextProps.activeEntity.tripPatterns && !this.props.activeEntity.tripPatterns ||
            !shallowEqual(nextProps.feedSource, this.props.feedSource) ||
            nextProps.activeComponent !== this.props.activeComponent ||
            !this.props.activeEntity && nextProps.activeEntity ||
            // TODO: add bounds to shouldComponentUpdate and move mapZoom/bounds to mapState reducer
            nextProps.drawStops && !shallowEqual(nextProps.mapState.bounds, this.props.mapState.bounds) ||
            !shallowEqual(nextProps.drawStops, this.props.drawStops) ||
            !shallowEqual(nextProps.tripPatterns, this.props.tripPatterns) ||
            !shallowEqual(nextProps.zoomToTarget, this.props.zoomToTarget) ||
            !shallowEqual(nextProps.editSettings, this.props.editSettings) ||
            !shallowEqual(nextProps.subEntityId, this.props.subEntityId) ||
            !shallowEqual(nextProps.currentPattern, this.props.activePattern) ||
            // nextProps.activeComponent === 'stop' && this.props.mapState.zoom !== nextProps.mapState.zoom ||
            nextProps.activeComponent === 'stop' && this.props.activeEntity && nextProps.activeEntity && (this.props.activeEntity.stop_lon !== nextProps.activeEntity.stop_lon || this.props.activeEntity.stop_lat !== nextProps.activeEntity.stop_lat) ||
            nextProps.activeEntityId !== this.props.activeEntityId ||
            nextProps.sidebarExpanded !== this.props.sidebarExpanded

    return shouldUpdate
  }
  async _mapRightClicked (e) {
    switch (this.props.activeComponent) {
      case 'stop':
        // if newly created stop is selected
        let stopLatLng = clickToLatLng(e.latlng)
        if (this.props.activeEntity && this.props.activeEntity.id === 'new') {
          this.props.updateActiveEntity(this.props.activeEntity, this.props.activeComponent, stopLatLng)
          this.refs[this.props.activeEntity.id].leafletElement.setLatLng(e.latlng)
        } else if (this.props.entities && this.props.entities.findIndex(e => e.id === 'new') === -1) {
          const stop = await constructStop(e.latlng, this.props.feedSource.id)
          this.props.newGtfsEntity(this.props.feedSource.id, this.props.activeComponent, stop)
        }
        break
      default:
        break
    }
  }
  // async addStopAtPoint (latlng, addToPattern = false, index) {
  //   // create stop
  //   const stop = await constructStop(latlng, this.props.feedSource.id)
  //   const s = await this.props.newGtfsEntity(this.props.feedSource.id, 'stop', stop, true)
  //   const gtfsStop = stopToGtfs(s)
  //   // add stop to end of pattern
  //   if (addToPattern) {
  //     await this.props.addStopToPattern(this.props.activePattern, gtfsStop, index)
  //   }
  //   return gtfsStop
  // }
  _mapBaseLayerChanged = (e) => {
    const layer = MAP_LAYERS.find(l => l.name === e.name)
    console.log('base layer changed', e)
    this.props.updateUserMetadata(this.props.user.profile, {editor: {map_id: layer.id}})
  }
  async _mapClicked (e) {
    if (this.props.activeComponent === 'stop') {
      // TODO: replace with spatial tree
      // locate stop based on latlng
      const selectedStop = this.props.entities.find(stop => Math.round(stop.stop_lat * 1000) / 1000 === Math.round(e.latlng.lat * 1000) / 1000 && Math.round(stop.stop_lon * 1000) / 1000 === Math.round(e.latlng.lng * 1000) / 1000)
      console.log('map click selected -->', selectedStop)
      if (selectedStop) {
        if (this.props.activeEntity && this.props.activeEntity.id === selectedStop.id) {
          // do nothing, the user just clicked the current stop
        } else {
          this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, selectedStop)
        }
      }
    }
    if (this.props.subComponent === 'trippattern' && this.props.editSettings.editGeometry) {
      switch (this.props.editSettings.onMapClick) {
        case 'NO_ACTION':
          break
        case 'ADD_STOP_AT_CLICK':
          return this.props.addStopAtPoint(e.latlng, true, null, this.props.activePattern)
        case 'ADD_STOPS_AT_INTERSECTIONS':
          return this.props.addStopAtIntersection(e.latlng, this.props.activePattern)
        case 'ADD_STOPS_AT_INTERVAL':
          return this.props.addStopAtInterval(e.latlng, this.props.activePattern)
        default:
          break
      }
    }
  }
  _mapBoundsChanged = (e) => {
    if (this.state.zoomToTarget) {
      setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
      return false
    } else {
      const zoom = e.target.getZoom()
      const bounds = e.target.getBounds()
      if (this.props.mapState.zoom !== zoom) {
        this.props.updateMapSetting({zoom})
      }
      if (!bounds.equals(this.props.mapState.bounds)) {
        this.props.updateMapSetting({bounds: e.target.getBounds()})
      }
    }
  }
  getMapComponents (component, entity, subEntityId, activePattern, stops, editSettings, mapState) {
    switch (component) {
      case 'route':
        if (!entity) return null
        return (
          <FeatureGroup>
            <PatternsLayer
              route={entity}
              subEntityId={subEntityId}
              activePattern={activePattern}
              patternCoordinates={this.props.editSettings.patternCoordinates}
              activeEntity={entity}
              editSettings={editSettings}
              controlPoints={this.props.controlPoints}
              constructControlPoint={this.props.constructControlPoint} />
            <DirectionIconsLayer
              patternCoordinates={this.props.editSettings.patternCoordinates}
              mapState={mapState} />
            <ControlPointsLayer
              stops={stops}
              activePattern={activePattern}
              editSettings={editSettings}
              handlePatternEdit={this.props.handlePatternEdit}
              updateControlPoint={this.props.updateControlPoint}
              removeControlPoint={this.props.removeControlPoint}
              updateActiveEntity={this.props.updateActiveEntity}
              handleControlPointDragEnd={this.props.handleControlPointDragEnd}
              updatePatternCoordinates={this.props.updatePatternCoordinates}
              controlPoints={this.props.controlPoints}
              polyline={activePattern && this.refs[activePattern.id]} />
            <PatternStopsLayer
              stops={stops}
              activePattern={activePattern}
              removeStopFromPattern={this.props.removeStopFromPattern}
              entityEdited={this.props.entityEdited}
              saveActiveEntity={this.props.saveActiveEntity}
              setActiveEntity={this.props.setActiveEntity}
              feedSource={this.props.feedSource}
              controlPoints={this.props.controlPoints}
              addStopToPattern={this.props.addStopToPattern}
              updateActiveEntity={this.props.updateActiveEntity}
              editSettings={editSettings} />
            <AddableStopsLayer
              stops={stops}
              activePattern={activePattern}
              addStopToPattern={this.props.addStopToPattern}
              editSettings={editSettings}
              mapState={mapState} />
          </FeatureGroup>
        )
      case 'stop':
        return (
          <StopsLayer
            mapState={mapState}
            stopTree={this.props.stopTree}
            drawStops={this.props.drawStops}
            activeEntity={entity}
            updateActiveEntity={this.props.updateActiveEntity}
            setActiveEntity={this.props.setActiveEntity}
            feedSource={this.props.feedSource} />
        )
      default:
        return null
    }
  }
  _overlayAdded = (e) => {
    if (e.name === 'Route alignments' && !this.props.tripPatterns) {
      this.props.fetchTripPatterns(this.props.feedSource.id)
    }
  }
  render () {
    const {
      feedSource,
      mapState,
      offset,
      sidebarExpanded,
      hidden,
      tripPatterns,
      user,
      tableData,
      activeComponent,
      activeEntity,
      subEntityId,
      activePattern,
      editSettings
    } = this.props
    const { zoomToTarget, width, willMount } = this.state
    let fsBounds = getFeedBounds(feedSource, 0.005)
    let bounds = zoomToTarget
      ? mapState.bounds
      : this.refs.map
      ? this.refs.map.leafletElement.getBounds()
      : fsBounds
    const mapStyle = {
      height: '100%',
      width: `${width - offset - (sidebarExpanded ? 130 : 50)}px`,
      position: 'absolute',
      left: `${offset}px`,
      display: hidden ? 'none' : 'initial'
    }
    let mapProps = {
      ref: 'map',
      zoomControl: false,
      style: mapStyle,
      maxBounds: [[200, 180], [-200, -180]],
      onContextMenu: (e) => this._mapRightClicked(e),
      onClick: (e) => this._mapClicked(e),
      onZoomEnd: this._mapBoundsChanged,
      onMoveEnd: this._mapBoundsChanged,
      onBaseLayerChange: this._mapBaseLayerChanged,
      scrollWheelZoom: true,
      onOverlayAdd: this._overlayAdded
    }
    if (willMount || zoomToTarget) {
      mapProps.bounds = bounds
    }
    return (
      <Map {...mapProps}>
        <ZoomControl position='topright' />
        <EditorMapLayersControl
          tripPatterns={tripPatterns}
          user={user}
          stops={tableData.stop} />
        {!hidden && this.getMapComponents(activeComponent, activeEntity, subEntityId, activePattern, tableData.stop, editSettings, mapState)}
        {mapState.routesGeojson &&
          <GeoJson
            key={mapState.routesGeojson.key}
            data={mapState.routesGeojson} />
        }
      </Map>
    )
  }
}
