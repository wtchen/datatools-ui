import { connect } from 'react-redux'

import GtfsEditor  from '../components/GtfsEditor'
import { componentList } from '../util/gtfs'
import { fetchFeedSourceAndProject, fetchFeedVersion } from '../../manager/actions/feeds'
import {
  fetchFeedInfo
} from '../actions/feedInfo'
import {
  fetchStops,
  fetchStopsForTripPattern,
} from '../actions/stop'
import {
  fetchRoutes
} from '../actions/route'
import {
  fetchTripPatterns,
  fetchTripPatternsForRoute,
  undoActiveTripPatternEdits,
  updateControlPoint,
  addControlPoint,
  removeControlPoint,
} from '../actions/tripPattern'
import {
  fetchTripsForCalendar,
  saveTripsForCalendar,
  deleteTripsForCalendar,
} from '../actions/trip'
import {
  setActiveGtfsEntity,
  newGtfsEntity,
  cloneGtfsEntity,
  toggleEditSetting,
  updateMapSetting,
  saveActiveGtfsEntity,
  resetActiveGtfsEntity,
  deleteGtfsEntity,
  settingActiveGtfsEntity,
  updateActiveGtfsEntity,
  clearGtfsContent,
  addGtfsRow,
  updateGtfsField,
  deleteGtfsRow,
  saveGtfsRow,
  getGtfsTable,
  uploadGtfsFeed,
  downloadGtfsFeed,
  importGtfsFromGtfs,
  loadGtfsEntities,
  receiveGtfsEntities,
  uploadBrandingAsset
} from '../actions/editor'
import { updateUserMetadata } from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId // location.pathname.split('/')[2]
  const activeComponent = ownProps.routeParams.subpage // location.pathname.split('/')[4]
  const subComponent = ownProps.routeParams.subsubpage // location.pathname.split('/')[5]
  const subSubComponent = ownProps.routeParams.subsubcomponent // location.pathname.split('/')[6]
  const activeEntityId = ownProps.routeParams.entity // location.pathname.split('/')[7]
  const activeSubEntity = ownProps.routeParams.subentity // location.pathname.split('/')[8]
  const activeSubSubEntity = ownProps.routeParams.subsubentity // location.pathname.split('/')[9]
  const activeEntity =
    state.editor.active && state.editor.active.entity && state.editor.active.entity.id === activeEntityId
    ? state.editor.active.entity
    : state.editor.active && state.editor.active.entity && activeComponent === 'feedinfo'
    ? state.editor.active.entity
    : null
  // const activeSubEntity = state.editor.active && state.editor.active.subEntity && state.editor.active.subEntity.id === activeEntityId
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

  // const isEditingGeometry = state.editor.editSettings.editGeometry
  // const isAddingStops = state.editor.editSettings.addStops
  // const isFollowingStreets = state.editor.editSettings.followStreets
  // const isSnappingToStops = state.editor.editSettings.snapToStops
  // const isHidingStops = state.editor.editSettings.hideStops
  const controlPoints = state.editor.editSettings.controlPoints && state.editor.editSettings.controlPoints.length
    ? state.editor.editSettings.controlPoints[state.editor.editSettings.controlPoints.length - 1]
    : []
  // const editActions = state.editor.editSettings.actions
  // const coordinatesHistory = state.editor.editSettings.coordinatesHistory
  const editSettings = state.editor.editSettings
  // const mapZoom = state.editor.mapState.zoom
  // const mapBounds = state.editor.mapState.bounds
  const mapState = state.editor.mapState
  const stopTree = state.editor.stopTree
  const tableView = ownProps.location.query && ownProps.location.query.table === 'true'
  const entities = state.editor.tableData[activeComponent]
  let user = state.user
  // find the containing project
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.feedSources) return false
        return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
      })
    : null

  let feedSource
  if (project) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }

  let feedInfo = state.editor.tableData.feedinfo

  return {
    tableData: state.editor.tableData,
    tripPatterns: state.editor.tripPatterns,
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
    activeSubEntity,
    // activeSubEntityId,
    activeSubSubEntity,
    editSettings,
    mapState,
    stopTree,
    // isAddingStops,
    // isEditingGeometry,
    // isFollowingStreets,
    // isSnappingToStops,
    // isHidingStops,
    controlPoints,
    // coordinatesHistory,
    // editActions,
    // mapZoom,
    // mapBounds
    sidebarExpanded: state.ui.sidebarExpanded
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const activeComponent = ownProps.routeParams.subpage
  const subComponent = ownProps.routeParams.subsubpage
  const subSubComponent = ownProps.routeParams.subsubcomponent
  const activeEntityId = ownProps.routeParams.entity
  const activeSubEntity = ownProps.routeParams.subentity
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
            //// FETCH trip patterns if route selected
            .then((entities) => {
              if (activeEntityId === 'new') {
                dispatch(newGtfsEntity(feedSourceId, activeComponent))
              }
              else if (activeEntityId && entities.findIndex(e => e.id === activeEntityId) === -1) {
                console.log('bad entity id, going back to ' + activeComponent)
                return dispatch(setActiveGtfsEntity(feedSourceId, activeComponent))
              }
              dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, activeSubEntity, subSubComponent, activeSubSubEntity))
              if (activeComponent === 'route' && activeEntityId) {
                dispatch(fetchTripPatternsForRoute(feedSourceId, activeEntityId))
                .then((tripPatterns) => {
                  let pattern = tripPatterns && tripPatterns.find(p => p.id === activeSubEntity)
                  if (subSubComponent === 'timetable' && activeSubSubEntity) {
                    dispatch(fetchTripsForCalendar(feedSourceId, pattern, activeSubSubEntity))
                  }
                })
              }
            })
          }
          else {
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

      // Clear gtfs content if no active component
      // if (!activeComponent) {
      //   dispatch(clearGtfsContent())
      // }

      // otherwise, get active table
      // else {
      //
      // }
      dispatch(fetchTripPatterns(feedSourceId))
    },
    onComponentUpdate: (prevProps, newProps) => {
      // handle back button presses by re-setting active gtfs entity
      if (prevProps.activeEntityId !== 'new' &&
        (prevProps.activeComponent !== newProps.activeComponent ||
        prevProps.activeEntityId !== newProps.activeEntityId ||
        prevProps.subComponent !== newProps.subComponent ||
        prevProps.activeSubEntity !== newProps.activeSubEntity ||
        prevProps.subSubComponent !== newProps.subSubComponent ||
        prevProps.activeSubSubEntity !== newProps.activeSubSubEntity)
      ) {
        console.log('handling back button')
        dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, activeSubEntity, subSubComponent, activeSubSubEntity))
      }
    },
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
      if(feedSource) dispatch(loadGtfsEntities(tableId, rows, feedSource))
    },
    toggleEditSetting: (setting) => {
      dispatch(toggleEditSetting(setting))
    },
    updateMapSetting: (props) => {
      dispatch(updateMapSetting(props))
    },
    gtfsEntitySelected: (type, entity) => {
      dispatch(receiveGtfsEntities([entity]))
    },
    uploadBrandingAsset: (feedSourceId, entityId, component, file) => {
      dispatch(uploadBrandingAsset(feedSourceId, entityId, component, file))
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
      // .then(entity => {
      //   // dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
      // })
    },
    saveTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => {
      return dispatch(saveTripsForCalendar(feedSourceId, pattern, calendarId, trips))
    },
    deleteTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => {
      return dispatch(deleteTripsForCalendar(feedSourceId, pattern, calendarId, trips))
    },
    cloneEntity: (feedSourceId, component, entityId, save) => {
      dispatch(cloneGtfsEntity(feedSourceId, component, entityId, save))
    },
    newEntityClicked: (feedSourceId, component, props, save) => {
      dispatch(newGtfsEntity(feedSourceId, component, props, save))
    },
    clearGtfsContent: () => { dispatch(clearGtfsContent()) },
    undoActiveTripPatternEdits: () => { dispatch(undoActiveTripPatternEdits()) },
    addControlPoint: (controlPoint, index) => { dispatch(addControlPoint(controlPoint, index)) },
    removeControlPoint: (index) => { dispatch(removeControlPoint(index)) },
    updateControlPoint: (index, point, distance) => { dispatch(updateControlPoint(index, point, distance)) },
    fetchTripPatternsForRoute: (feedSourceId, routeId) => {
      dispatch(fetchTripPatternsForRoute(feedSourceId, routeId))
    },
    fetchStopsForTripPattern: (feedSourceId, tripPatternId) => {
      dispatch(fetchStopsForTripPattern(feedSourceId, tripPatternId))
    },
    fetchStops: (feedSourceId) => {
      dispatch(fetchStops(feedSourceId))
    },
    fetchTripsForCalendar: (feedSourceId, pattern, calendarId) => {
      dispatch(fetchTripsForCalendar(feedSourceId, pattern, calendarId))
    },
  }
}

const ActiveGtfsEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsEditor)

export default ActiveGtfsEditor
