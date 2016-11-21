import { connect } from 'react-redux'

import GtfsEditor from '../components/GtfsEditor'
import { componentList } from '../util/gtfs'
import { fetchFeedSourceAndProject } from '../../manager/actions/feeds'
import {
  fetchFeedInfo
} from '../actions/feedInfo'
import {
  fetchStops,
  fetchStopsForTripPattern
} from '../actions/stop'
import {
  fetchTripPatternsForRoute,
  fetchTripPatterns,
  undoActiveTripPatternEdits,
  updateControlPoint,
  addControlPoint,
  removeControlPoint
} from '../actions/tripPattern'
import {
  fetchTripsForCalendar
} from '../actions/trip'
import {
  setActiveGtfsEntity,
  newGtfsEntity,
  newGtfsEntities,
  cloneGtfsEntity,
  updateEditSetting,
  updateMapSetting,
  saveActiveGtfsEntity,
  resetActiveGtfsEntity,
  deleteGtfsEntity,
  updateActiveGtfsEntity,
  clearGtfsContent,
  addGtfsRow,
  updateGtfsField,
  deleteGtfsRow,
  saveGtfsRow,
  getGtfsTable,
  loadGtfsEntities,
  receiveGtfsEntities,
  uploadBrandingAsset
} from '../actions/editor'
import { updateUserMetadata } from '../../manager/actions/user'
import { findProjectByFeedSource } from '../../manager/util'
import { setTutorialHidden } from '../../manager/actions/ui'

const mapStateToProps = (state, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId // location.pathname.split('/')[2]
  const activeComponent = ownProps.routeParams.subpage // location.pathname.split('/')[4]
  // const { activeComponent, subComponent, subSubComponent, activeEntityId, subEntityId, activeSubSubEntity } = ownProps.routeParams.subpage // location.pathname.split('/')[4]
  const subComponent = ownProps.routeParams.subsubpage // location.pathname.split('/')[5]
  const subSubComponent = ownProps.routeParams.subsubcomponent // location.pathname.split('/')[6]
  const activeEntityId = ownProps.routeParams.entity // location.pathname.split('/')[7]
  const subEntityId = ownProps.routeParams.subentity // location.pathname.split('/')[8]
  const activeSubSubEntity = ownProps.routeParams.subsubentity // location.pathname.split('/')[9]
  const activeEntity =
    state.editor.active && state.editor.active.entity && state.editor.active.entity.id === activeEntityId
    ? state.editor.active.entity
    : state.editor.active && state.editor.active.entity && activeComponent === 'feedinfo'
    ? state.editor.active.entity
    : null
  const activePattern = state.editor.active && state.editor.active.subEntity
  // const subEntityId = state.editor.active && state.editor.active.subEntity && state.editor.active.subEntity.id === activeEntityId
  // ? state.editor.active.subEntity
  // : state.editor.active && state.editor.active.subEntity && activeComponent === 'feedinfo'
  // ? state.editor.active.subEntity
  // : null
    // ownProps.routeParams.entity && state.editor.tableData[activeComponent]
    // ? state.editor.tableData[activeComponent].find(e => ownProps.routeParams.entity === e.id)
    // : null
  const entityEdited = subComponent === 'trippattern'
    ? state.editor.active.patternEdited
    : state.editor.active && state.editor.active.edited

  const controlPoints = state.editor.editSettings.controlPoints && state.editor.editSettings.controlPoints.length
    ? state.editor.editSettings.controlPoints[state.editor.editSettings.controlPoints.length - 1]
    : []
  const editSettings = state.editor.editSettings
  const mapState = state.editor.mapState
  const stopTree = state.editor.stopTree
  const tableView = ownProps.location.query && ownProps.location.query.table === 'true'
  const entities = state.editor.tableData[activeComponent]
  let user = state.user

  // find the containing project
  const project = findProjectByFeedSource(state, feedSourceId)
  const feedSource = project && project.feedSources.find(fs => fs.id === feedSourceId)

  const feedInfo = state.editor.tableData.feedinfo

  return {
    tableData: state.editor.tableData,
    hideTutorial: state.ui.hideTutorial,
    tripPatterns: state.editor.tripPatterns,
    timetable: state.editor.timetable,
    // gtfsEntityLookup: state.editor.gtfsEntityLookup,
    // validation: state.editor.validation,
    // currentTable: state.routing.locationBeforeTransitions.hash ? state.routing.locationBeforeTransitions.hash.split('#')[1] : 'agency',
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
    // subEntityIdId,
    activeSubSubEntity,
    editSettings,
    mapState,
    stopTree,
    controlPoints,
    sidebarExpanded: state.ui.sidebarExpanded
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const activeComponent = ownProps.routeParams.subpage
  const subComponent = ownProps.routeParams.subsubpage
  const subSubComponent = ownProps.routeParams.subsubcomponent
  const activeEntityId = ownProps.routeParams.entity
  const subEntityId = ownProps.routeParams.subentity
  const activeSubSubEntity = ownProps.routeParams.subsubentity

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
              dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
            }
          }
        })
        .then(() => {
          if (componentList.indexOf(activeComponent) !== -1) {
            dispatch(getGtfsTable(activeComponent, feedSourceId))
            // FETCH trip patterns if route selected
            .then((entities) => {
              if (activeEntityId === 'new') {
                dispatch(newGtfsEntity(feedSourceId, activeComponent))
              } else if (activeEntityId && entities.findIndex(e => e.id === activeEntityId) === -1) {
                console.log('bad entity id, going back to ' + activeComponent)
                return dispatch(setActiveGtfsEntity(feedSourceId, activeComponent))
              }
              dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, subEntityId, subSubComponent, activeSubSubEntity))
              if (activeComponent === 'route' && activeEntityId) {
                dispatch(fetchTripPatternsForRoute(feedSourceId, activeEntityId))
                .then((tripPatterns) => {
                  let pattern = tripPatterns && tripPatterns.find(p => p.id === subEntityId)
                  if (subSubComponent === 'timetable' && activeSubSubEntity) {
                    dispatch(fetchTripsForCalendar(feedSourceId, pattern, activeSubSubEntity))
                  }
                })
              }
            })
          } else {
            dispatch(setActiveGtfsEntity(feedSourceId))
          }
        })
      } else {
        dispatch(fetchFeedInfo(feedSourceId))
        for (var i = 0; i < tablesToFetch.length; i++) {
          if (tablesToFetch[i] !== activeComponent) {
            dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
          }
        }
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

    // OLD ROW FUNCTIONS
    newRowClicked: (tableId) => {
      dispatch(addGtfsRow(tableId))
    },
    deleteRowClicked: (tableId, rowIndex) => {
      dispatch(deleteGtfsRow(tableId, rowIndex))
    },
    getGtfsTable: (tableId, feedId) => {
      dispatch(getGtfsTable(tableId, feedId))
    },
    saveRowClicked: (tableId, rowIndex, feedId) => {
      dispatch(saveGtfsRow(tableId, rowIndex, feedId))
    },
    fieldEdited: (tableId, rowIndex, fieldName, newValue) => {
      dispatch(updateGtfsField(tableId, rowIndex, fieldName, newValue))
    },
    newRowsDisplayed: (tableId, rows, feedSource) => {
      if (feedSource) dispatch(loadGtfsEntities(tableId, rows, feedSource))
    },

    // NEW GENERIC GTFS/EDITOR FUNCTIONS
    updateEditSetting: (setting, value) => {
      dispatch(updateEditSetting(setting, value))
    },
    updateMapSetting: (props) => {
      dispatch(updateMapSetting(props))
    },
    gtfsEntitySelected: (type, entity) => {
      dispatch(receiveGtfsEntities([entity]))
    },
    setActiveEntity: (feedSourceId, component, entity, subComponent, subEntity, subSubComponent, subSubEntity) => {
      let entityId = entity && entity.id
      let subEntityId = subEntity && subEntity.id
      let subSubEntityId = subSubEntity && subSubEntity.id
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
    fetchTripsForCalendar: (feedSourceId, pattern, calendarId) => { dispatch(fetchTripsForCalendar(feedSourceId, pattern, calendarId)) },

    // TRIP PATTERN EDIT FUNCTIONS
    undoActiveTripPatternEdits: () => { dispatch(undoActiveTripPatternEdits()) },
    addControlPoint: (controlPoint, index) => { dispatch(addControlPoint(controlPoint, index)) },
    removeControlPoint: (index) => { dispatch(removeControlPoint(index)) },
    updateControlPoint: (index, point, distance) => { dispatch(updateControlPoint(index, point, distance)) },

    // EDITOR UI
    setTutorialHidden: (value) => { dispatch(setTutorialHidden(value)) },
  }
}

const ActiveGtfsEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsEditor)

export default ActiveGtfsEditor
