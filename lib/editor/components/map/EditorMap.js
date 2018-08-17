// @flow

import React, {Component} from 'react'
import {Map, ZoomControl, FeatureGroup, GeoJSON} from 'react-leaflet'
import {shallowEqual} from 'react-pure-render'

import AddableStopsLayer from './AddableStopsLayer'
import EditorMapLayersControl from './EditorMapLayersControl'
import ControlPointsLayer from './ControlPointsLayer'
import DirectionIconsLayer from './DirectionIconsLayer'
import PatternDebugLines from './pattern-debug-lines'
import PatternsLayer from './PatternsLayer'
import PatternStopsLayer from './PatternStopsLayer'
import StopsLayer from './StopsLayer'
import {MAP_LAYERS, constructStop, clickToLatLng, getFeedBounds} from '../../util/map'
import {entityIsNew} from '../../util/objects'

import type {
  ControlPoint,
  Coordinates,
  Entity,
  Feed,
  FeedInfo,
  GtfsRoute,
  GtfsStop,
  LatLng,
  Pattern,
  PatternStop
} from '../../../types'
import type {MapState} from '../../reducers/mapState'
import type {EditSettingsState} from '../../reducers/settings'
import type {UserState} from '../../../manager/reducers/user'

type Props = {
  addStopAtPoint: (LatLng, boolean, any, Pattern) => void,
  addStopAtIntersection: (LatLng, Pattern) => void,
  addStopAtInterval: (LatLng, Pattern, Array<ControlPoint>) => void,
  addStopToPattern: (Pattern, GtfsStop) => void,
  controlPoints: Array<ControlPoint>,
  activePattern: Pattern,
  subEntityId: number,
  subEntity: number,
  activeEntityId: number,
  activeComponent: string,
  subComponent: string,
  currentPattern: Pattern,
  stops: Array<GtfsStop>,
  editSettings: EditSettingsState,
  mapState: MapState,
  feedSource: Feed,
  feedInfo: FeedInfo,
  zoomToTarget: ?number,
  entities: Array<Entity>,
  activeEntity: Entity,
  entityEdited: boolean,
  offset: number,
  tripPatterns: Array<Pattern>,
  updateActiveEntity: (Entity, string, any) => void,
  saveActiveEntity: () => void,
  setActiveEntity: () => void,
  newGtfsEntity: (string, string, Entity) => void,
  fetchTripPatterns: () => void,
  updateMapSetting: ({bounds?: any, target?: number, zoom?: number}) => void,
  removeControlPoint: () => void,
  updateUserMetadata: (any, any) => void,
  updatePatternStops: (Pattern, Array<PatternStop>) => void,
  handleControlPointDrag: () => void,
  handleControlPointDragEnd: () => void,
  handleControlPointDragStart: () => void,
  setActivePatternSegment: () => void,
  patternEdited: boolean,
  patternSegment: number,
  constructControlPoint: () => void,
  patternCoordinates: Array<Coordinates>,
  updateEditSetting: (string, any) => void,
  patternStop: {id: string, index: number},
  removeStopFromPattern: (Pattern, GtfsStop, number) => void,
  setActiveStop: ({id: ?any, index: ?number}) => void,
  user: UserState,
  sidebarExpanded: boolean,
  hidden: boolean,
  drawStops: boolean
}

type State = {
  width: number,
  willMount: boolean,
  height: number,
  zoomToTarget: boolean
}

export default class EditorMap extends Component<Props, State> {
  state = {
    width: 200,
    willMount: false,
    height: 200,
    zoomToTarget: false
  }

  _onResize = () => {
    this.setState({width: window.innerWidth, height: window.innerHeight})
    this.refs.map && setTimeout(this._invalidateSize, 500)
  }

  _invalidateSize = () => this.refs.map.leafletElement.invalidateSize()

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

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.offset !== this.props.offset || nextProps.hidden !== this.props.hidden) {
      this._onResize()
    }
    if (nextProps.zoomToTarget && !shallowEqual(nextProps.zoomToTarget, this.props.zoomToTarget)) {
      this.setState({zoomToTarget: true})
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    const {props} = this
    const {activeEntity, mapState} = props
    // don't update if component continues to be hidden
    if (nextProps.hidden && props.hidden) {
      return false
    }

    const shouldUpdate =
      !shallowEqual(nextState, this.state) ||
      !shallowEqual(nextProps, props) ||
      ((nextProps.activeComponent === 'stop' || nextProps.activeComponent === 'route') && nextProps.activeEntityId !== props.activeEntityId) ||
      (nextProps.activeEntity && activeEntity && nextProps.activeEntity.tripPatterns && !activeEntity.tripPatterns) ||
      !shallowEqual(nextProps.feedSource, props.feedSource) ||
      // TODO: add bounds to shouldComponentUpdate and move mapZoom/bounds to mapState reducer
      (nextProps.drawStops && !shallowEqual(nextProps.mapState.bounds, mapState.bounds)) ||
      (nextProps.activeComponent === 'stop' && activeEntity && nextProps.activeEntity &&
        // $FlowFixMe
        (activeEntity.stop_lon !== nextProps.activeEntity.stop_lon || activeEntity.stop_lat !== nextProps.activeEntity.stop_lat))

    return shouldUpdate
  }

  /**
   * Create new stop on map right click if the stops table/component is active.
   */
  _mapRightClicked = async (e: any) => {
    const {activeEntity, updateActiveEntity, activeComponent, entities, feedSource, newGtfsEntity} = this.props
    switch (activeComponent) {
      case 'stop':
        // if newly created stop is already selected
        const stopLatLng = clickToLatLng(e.latlng)
        if (activeEntity && entityIsNew(activeEntity)) {
          updateActiveEntity(activeEntity, activeComponent, stopLatLng)
          this.refs[activeEntity.id] && this.refs[activeEntity.id].leafletElement.setLatLng(e.latlng)
        } else if (entities && entities.findIndex(entityIsNew) === -1) {
          // if a new stop should be constructed
          const stop = await constructStop(e.latlng)
          newGtfsEntity(feedSource.id, activeComponent, stop)
        }
        break
      default:
        break
    }
  }

  _mapBaseLayerChanged = (e: any) => {
    const layer = MAP_LAYERS.find(l => l.name === e.name)
    if (!layer) return console.warn(`Could not locate map layer with name=${e.name}`, MAP_LAYERS)
    this.props.updateUserMetadata(this.props.user.profile, {editor: {map_id: layer.id}})
  }

  /**
   * Handle map click event.
   */
  _mapClicked = async (e: any) => {
    const {
      subComponent,
      editSettings,
      addStopAtPoint,
      activePattern,
      addStopAtIntersection,
      addStopAtInterval,
      controlPoints
    } = this.props
    // if (activeComponent === 'stop') {
    //   // locate stop based on latlng
    //   const selectedStop = entities.find(stop => Math.round(stop.stop_lat * 1000) / 1000 === Math.round(e.latlng.lat * 1000) / 1000 && Math.round(stop.stop_lon * 1000) / 1000 === Math.round(e.latlng.lng * 1000) / 1000)
    //   if (selectedStop) {
    //     if (activeEntity && activeEntity.id === selectedStop.id) {
    //       // do nothing, the user just clicked the current stop
    //     } else {
    //       setActiveEntity(feedSource.id, activeComponent, selectedStop)
    //     }
    //   }
    // }
    if (subComponent === 'trippattern' && editSettings.editGeometry) {
      // TODO: Prevent adding stops (at click, at interval, etc.) if the user
      // clicks the pattern line because they probably intended to add a control
      // point. See https://github.com/catalogueglobal/datatools-ui/issues/140
      // console.log(e)
      switch (editSettings.onMapClick) {
        case 'NO_ACTION':
          break
        case 'ADD_STOP_AT_CLICK':
          return addStopAtPoint(e.latlng, true, null, activePattern)
        case 'ADD_STOPS_AT_INTERSECTIONS':
          return addStopAtIntersection(e.latlng, activePattern)
        case 'ADD_STOPS_AT_INTERVAL':
          return addStopAtInterval(e.latlng, activePattern, controlPoints)
        default:
          break
      }
    }
  }

  _cancelZoomToTarget = () => this.setState({zoomToTarget: false})

  _mapBoundsChanged = (e: any) => {
    if (this.state.zoomToTarget) {
      setTimeout(this._cancelZoomToTarget, 200)
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

  _getMapComponents () {
    switch (this.props.activeComponent) {
      case 'route':
        if (!this.props.activeEntity) return null
        const castedRoute = ((this.props.activeEntity: any): GtfsRoute)
        // FIXME: this does not copy pattern coordinates like the below comment says. Does it need to?
        // Copy pattern coordinates
        const {patternCoordinates} = this.props
        return (
          <FeatureGroup>
            <PatternDebugLines
              activePattern={this.props.activePattern}
              controlPoints={this.props.controlPoints}
              editSettings={this.props.editSettings}
              patternSegment={this.props.patternSegment}
              patternStop={this.props.patternStop}
              stops={this.props.stops} />
            <PatternsLayer
              activeEntity={this.props.activeEntity}
              activePattern={this.props.activePattern}
              constructControlPoint={this.props.constructControlPoint}
              controlPoints={this.props.controlPoints}
              editSettings={this.props.editSettings}
              feedSource={this.props.feedSource}
              patternCoordinates={this.props.patternCoordinates}
              route={castedRoute}
              setActiveEntity={this.props.setActiveEntity}
              setActivePatternSegment={this.props.setActivePatternSegment}
              patternSegment={this.props.patternSegment}
              subEntityId={this.props.subEntityId}
              updateEditSetting={this.props.updateEditSetting} />
            <DirectionIconsLayer
              mapState={this.props.mapState}
              patternSegment={this.props.patternSegment}
              editSettings={this.props.editSettings}
              patternCoordinates={patternCoordinates} />
            {this.props.editSettings.editGeometry &&
              <ControlPointsLayer
                activePattern={this.props.activePattern}
                controlPoints={this.props.controlPoints}
                patternCoordinates={this.props.patternCoordinates}
                editSettings={this.props.editSettings}
                patternSegment={this.props.patternSegment}
                handleControlPointDrag={this.props.handleControlPointDrag}
                handleControlPointDragEnd={this.props.handleControlPointDragEnd}
                handleControlPointDragStart={this.props.handleControlPointDragStart}
                removeControlPoint={this.props.removeControlPoint}
                setActivePatternSegment={this.props.setActivePatternSegment}
                stops={this.props.stops}
                updateActiveEntity={this.props.updateActiveEntity} />
            }
            <PatternStopsLayer
              activePattern={this.props.activePattern}
              addStopToPattern={this.props.addStopToPattern}
              controlPoints={this.props.controlPoints}
              editSettings={this.props.editSettings}
              feedSource={this.props.feedSource}
              patternEdited={this.props.patternEdited}
              patternSegment={this.props.patternSegment}
              patternStop={this.props.patternStop}
              removeStopFromPattern={this.props.removeStopFromPattern}
              setActiveStop={this.props.setActiveStop}
              saveActiveEntity={this.props.saveActiveEntity}
              setActiveEntity={this.props.setActiveEntity}
              stops={this.props.stops}
              updateActiveEntity={this.props.updateActiveEntity}
              updatePatternStops={this.props.updatePatternStops} />
            <AddableStopsLayer
              activePattern={this.props.activePattern}
              addStopToPattern={this.props.addStopToPattern}
              editSettings={this.props.editSettings}
              mapState={this.props.mapState}
              stops={this.props.stops} />
          </FeatureGroup>
        )
      case 'stop':
        const castedStop = ((this.props.activeEntity: any): GtfsStop)
        return (
          <StopsLayer
            activeEntity={castedStop}
            drawStops={this.props.drawStops}
            feedSource={this.props.feedSource}
            mapState={this.props.mapState}
            setActiveEntity={this.props.setActiveEntity}
            stops={this.props.stops}
            updateActiveEntity={this.props.updateActiveEntity} />
        )
      default:
        return null
    }
  }

  _overlayAdded = (e: any) => {
    if (e.name === 'Route alignments' && !this.props.tripPatterns) {
      this.props.fetchTripPatterns(this.props.feedSource.id)
    }
  }

  render () {
    const {
      feedSource,
      hidden,
      mapState,
      offset,
      sidebarExpanded,
      tripPatterns,
      user
    } = this.props
    const { zoomToTarget, width, willMount } = this.state
    const fsBounds = getFeedBounds(feedSource, 0.005)

    // if zoomToTarget is not false (i.e., some entity ID), set the bounds to the mapState bounds
    // else, default to current map bounds
    // else, go to feed source bounds
    const bounds = zoomToTarget
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
    const mapProps = {
      ref: 'map',
      bounds: undefined,
      zoomControl: false,
      style: mapStyle,
      maxBounds: [[200, 180], [-200, -180]],
      onContextMenu: this._mapRightClicked,
      onClick: this._mapClicked,
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
          stops={this.props.stops} />
        {/* Primary editor map components (routes, stops, etc.) to be rendered based on active components */}
        {!hidden &&
          this._getMapComponents()
        }
        {/* Routes GeoJSON to display as a visual aid in constructing trip patterns */}
        {mapState.routesGeojson &&
          <GeoJSON
            key={mapState.routesGeojson.key}
            data={mapState.routesGeojson} />
        }
      </Map>
    )
  }
}
