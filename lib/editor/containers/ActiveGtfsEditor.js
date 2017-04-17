import { connect } from 'react-redux'

import GtfsEditor from '../components/GtfsEditor'
import { fetchFeedSourceAndProject } from '../../manager/actions/feeds'
import { fetchFeedInfo } from '../actions/feedInfo'
import {
  fetchStops,
  fetchStopsForTripPattern
} from '../actions/stop'
import {
  fetchTripPatternsForRoute,
  fetchTripPatterns,
  undoActiveTripPatternEdits
} from '../actions/tripPattern'
import {
  removeStopFromPattern,
  addStopAtPoint,
  addStopAtIntersection,
  addStopAtInterval,
  addStopToPattern } from '../actions/map/stopStrategies'
import {
  updateControlPoint,
  addControlPoint,
  handleControlPointDrag,
  handleControlPointDragEnd,
  removeControlPoint,
  updateMapSetting,
  constructControlPoint,
  updatePatternCoordinates
} from '../actions/map'
import { fetchTripsForCalendar } from '../actions/trip'
import { updateEditSetting,
  setActiveGtfsEntity,
  deleteGtfsEntity,
  updateActiveGtfsEntity,
  resetActiveGtfsEntity,
  clearGtfsContent,
  saveActiveGtfsEntity } from '../actions/active'
import {
  fetchActiveTable,
  newGtfsEntity,
  newGtfsEntities,
  cloneGtfsEntity,
  getGtfsTable,
  uploadBrandingAsset
} from '../actions/editor'
import { updateUserMetadata } from '../../manager/actions/user'
import { findProjectByFeedSource } from '../../manager/util'
import { setTutorialHidden } from '../../manager/actions/ui'

const mapStateToProps = (state, ownProps) => {
  const {
    feedSourceId,
    activeComponent,
    subComponent,
    subSubComponent,
    activeEntityId,
    subEntityId,
    activeSubSubEntity
  } = ownProps.routeParams
  const activeEntity =
    state.editor.data.active.entity && state.editor.data.active.entity.id === activeEntityId
    ? state.editor.data.active.entity
    : state.editor.data.active.entity && activeComponent === 'feedinfo'
    ? state.editor.data.active.entity
    : null
  const activePattern = state.editor.data.active.subEntity
  const entityEdited = subComponent === 'trippattern'
    ? state.editor.data.active.patternEdited
    : state.editor.data.active.edited

  const controlPoints = state.editor.editSettings.controlPoints && state.editor.editSettings.controlPoints.length
    ? state.editor.editSettings.controlPoints[state.editor.editSettings.controlPoints.length - 1]
    : []
  const editSettings = state.editor.editSettings
  const mapState = state.editor.mapState
  const stopTree = state.editor.mapState.stopTree
  const tableView = ownProps.location.query && ownProps.location.query.table === 'true'
  const entities = state.editor.data.tables[activeComponent]
  const user = state.user

  // find the containing project
  const project = findProjectByFeedSource(state, feedSourceId)
  const feedSource = project && project.feedSources.find(fs => fs.id === feedSourceId)

  const feedInfo = state.editor.data.tables.feedinfo

  return {
    tableData: state.editor.data.tables,
    hideTutorial: state.ui.hideTutorial,
    tripPatterns: state.editor.data.tripPatterns,
    feedSource,
    entities,
    feedSourceId,
    feedInfo,
    entityEdited,
    tableView,
    project,
    user,
    activeComponent,
    subSubComponent,
    subComponent,
    activeEntity,
    activeEntityId,
    subEntityId,
    activePattern,
    activeSubSubEntity,
    editSettings,
    mapState,
    stopTree,
    controlPoints,
    sidebarExpanded: state.ui.sidebarExpanded
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {
    feedSourceId,
    activeComponent,
    subComponent,
    subSubComponent,
    activeEntityId,
    subEntityId,
    activeSubSubEntity
  } = ownProps.routeParams
  return {
    updateUserMetadata: (profile, props) => {
      dispatch(updateUserMetadata(profile, props))
    },
    onComponentMount: (initialProps) => {
      const tablesToFetch = ['calendar', 'agency', 'route', 'stop']

      // Get all GTFS tables except for the active table (activeComponent)
      if (!initialProps.feedSource || feedSourceId !== initialProps.feedSource.id) {
        dispatch(fetchFeedSourceAndProject(feedSourceId))
        .then(() => {
          dispatch(fetchFeedInfo(feedSourceId))
          for (var i = 0; i < tablesToFetch.length; i++) {
            if (tablesToFetch[i] !== activeComponent) {
              console.log('requesting ' + tablesToFetch[i])
              dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
            }
          }
        })
        .then(() => {
          var newId = activeEntityId
          dispatch(fetchActiveTable(activeComponent, newId, activeEntityId, feedSourceId, subComponent, subEntityId, subSubComponent, activeSubSubEntity))
        })
      } else {
        dispatch(fetchFeedInfo(feedSourceId))
        for (var i = 0; i < tablesToFetch.length; i++) {
          console.log(activeComponent, initialProps.tableData[activeComponent])
          if (tablesToFetch[i] !== activeComponent) {
            dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
            // TODO: add setActive here (e.g., for redirections from validation summary)
          }
        }
        var newId = activeEntityId
        dispatch(fetchActiveTable(activeComponent, newId, activeEntityId, feedSourceId, subComponent, subEntityId, subSubComponent, activeSubSubEntity))
      }

      // TODO: replace fetch trip patterns with map layer
      // dispatch(fetchTripPatterns(feedSourceId))
    },
    onComponentUpdate: (prevProps, newProps) => {
      // handle back button presses by re-setting active gtfs entity
      if (prevProps.activeEntityId !== 'new' &&
        (prevProps.activeComponent !== newProps.activeComponent ||
        prevProps.activeEntityId !== newProps.activeEntityId ||
        prevProps.subComponent !== newProps.subComponent ||
        prevProps.subEntityId !== newProps.subEntityId ||
        prevProps.subSubComponent !== newProps.subSubComponent ||
        prevProps.activeSubSubEntity !== newProps.activeSubSubEntity)
      ) {
        console.log('handling back button')
        dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, subEntityId, subSubComponent, activeSubSubEntity))
      }
    },

    // NEW GENERIC GTFS/EDITOR FUNCTIONS
    getGtfsTable: (activeComponent, feedSourceId) => dispatch(getGtfsTable(activeComponent, feedSourceId)),
    updateEditSetting: (setting, value) => {
      dispatch(updateEditSetting(setting, value))
    },
    updateMapSetting: (props) => {
      dispatch(updateMapSetting(props))
    },
    setActiveEntity: (feedSourceId, component, entity, subComponent, subEntity, subSubComponent, subSubEntity) => {
      const entityId = entity && entity.id
      const subEntityId = subEntity && subEntity.id
      const subSubEntityId = subSubEntity && subSubEntity.id
      dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
    },
    updateActiveEntity: (entity, component, props) => {
      dispatch(updateActiveGtfsEntity(entity, component, props))
    },
    resetActiveEntity: (entity, component) => {
      dispatch(resetActiveGtfsEntity(entity, component))
    },
    deleteEntity: (feedSourceId, component, entityId, routeId) => {
      dispatch(deleteGtfsEntity(feedSourceId, component, entityId, routeId))
    },
    saveActiveEntity: (component) => {
      return dispatch(saveActiveGtfsEntity(component))
    },
    cloneEntity: (feedSourceId, component, entityId, save) => {
      dispatch(cloneGtfsEntity(feedSourceId, component, entityId, save))
    },
    newGtfsEntity: (feedSourceId, component, props, save) => {
      return dispatch(newGtfsEntity(feedSourceId, component, props, save))
    },
    newGtfsEntities: (feedSourceId, component, propsArray, save) => {
      return dispatch(newGtfsEntities(feedSourceId, component, propsArray, save))
    },

    // ENTITY-SPECIFIC FUNCTIONS
    uploadBrandingAsset: (feedSourceId, entityId, component, file) => {
      dispatch(uploadBrandingAsset(feedSourceId, entityId, component, file))
    },

    clearGtfsContent: () => { dispatch(clearGtfsContent()) },
    fetchTripPatternsForRoute: (feedSourceId, routeId) => { dispatch(fetchTripPatternsForRoute(feedSourceId, routeId)) },
    fetchTripPatterns: (feedSourceId) => { dispatch(fetchTripPatterns(feedSourceId)) },
    fetchStopsForTripPattern: (feedSourceId, tripPatternId) => { dispatch(fetchStopsForTripPattern(feedSourceId, tripPatternId)) },
    fetchStops: (feedSourceId) => { dispatch(fetchStops(feedSourceId)) },
    fetchTripsForCalendar: (feedSourceId, pattern, calendarId) => dispatch(fetchTripsForCalendar(feedSourceId, pattern, calendarId)),

    // TRIP PATTERN EDIT FUNCTIONS
    undoActiveTripPatternEdits: () => { dispatch(undoActiveTripPatternEdits()) },
    updatePatternCoordinates: (coordinates) => { dispatch(updatePatternCoordinates(coordinates)) },
    removeStopFromPattern: (pattern, stop, index, controlPoints) => dispatch(removeStopFromPattern(pattern, stop, index, controlPoints)),
    addStopToPattern: (pattern, stop, index) => dispatch(addStopToPattern(pattern, stop, index)),
    addStopAtPoint: (latlng, addToPattern, index, activePattern) => dispatch(addStopAtPoint(latlng, addToPattern, index, activePattern)),
    addStopAtInterval: (latlng, activePattern) => dispatch(addStopAtInterval(latlng, activePattern)),
    addStopAtIntersection: (latlng, activePattern) => dispatch(addStopAtIntersection(latlng, activePattern)),
    addControlPoint: (controlPoint, index) => { dispatch(addControlPoint(controlPoint, index)) },
    removeControlPoint: (index, begin, end, pattern, polyline) => { dispatch(removeControlPoint(index, begin, end, pattern, polyline)) },
    updateControlPoint: (index, point, distance) => { dispatch(updateControlPoint(index, point, distance)) },
    constructControlPoint: (pattern, latlng, controlPoints) => { dispatch(constructControlPoint(pattern, latlng, controlPoints)) },
    handleControlPointDragEnd: (index, controlPoint, evt, pattern) => { dispatch(handleControlPointDragEnd(index, controlPoint, evt, pattern)) },
    handleControlPointDrag: (latlng, previous, next, pattern) => { dispatch(handleControlPointDrag(latlng, previous, next, pattern)) },

    // EDITOR UI
    setTutorialHidden: (value) => { dispatch(setTutorialHidden(value)) }
  }
}

const ActiveGtfsEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsEditor)

export default ActiveGtfsEditor
