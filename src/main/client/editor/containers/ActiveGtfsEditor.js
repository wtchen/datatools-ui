import { connect } from 'react-redux'

import GtfsEditor  from '../components/GtfsEditor'
import { fetchFeedSourceAndProject, fetchFeedVersion } from '../../manager/actions/feeds'
import {
  fetchFeedInfo,
} from '../actions/feedInfo'
import {
  fetchStops,
  fetchStopsForTripPattern,
} from '../actions/stop'
import {
  fetchRoutes,
} from '../actions/route'
import {
  fetchTripPatternsForRoute,
} from '../actions/tripPattern'
import {
  fetchTripsForCalendar,
} from '../actions/trip'
import {
  setActiveGtfsEntity,
  newGtfsEntity,
  saveActiveGtfsEntity,
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
  receiveGtfsEntities
} from '../actions/editor'

const mapStateToProps = (state, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const activeComponent = ownProps.routeParams.subpage // state.activeComponent ||
  const subComponent = ownProps.routeParams.subsubpage // state.activeSubComponent ||
  const subSubComponent = ownProps.routeParams.subsubcomponent // state.activeSubSubComponent ||
  const activeEntity = ownProps.routeParams.entity && state.editor.tableData[activeComponent] // state.activeEntity ||
    ? state.editor.tableData[activeComponent].find(e => ownProps.routeParams.entity === e.id)
    : null
  const activeSubEntity = ownProps.routeParams.subentity // state.activeSubEntityId ||
  const activeSubSubEntity = ownProps.routeParams.subsubentity // state.activeSubSubEntityId ||
  const entityEdited = state.editor.edited
  const tableView = ownProps.location.query && ownProps.location.query.table === 'true'
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
    // gtfsEntityLookup: state.editor.gtfsEntityLookup,
    // validation: state.editor.validation,
    // currentTable: state.routing.locationBeforeTransitions.hash ? state.routing.locationBeforeTransitions.hash.split('#')[1] : 'agency',
    feedSource,
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
    activeSubEntity,
    activeSubSubEntity,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const activeComponent = ownProps.routeParams.subpage
  const subComponent = ownProps.routeParams.subsubpage
  const subSubComponent = ownProps.routeParams.subsubcomponent
  const activeEntity = ownProps.routeParams.entity
  const activeSubEntity = ownProps.routeParams.subentity
  const activeSubSubEntity = ownProps.routeParams.subsubentity

  return {
    onComponentMount: (initialProps) => {

      if (!initialProps.feedSource || feedSourceId !== initialProps.feedSource.id) {
        dispatch(fetchFeedSourceAndProject(feedSourceId))
        .then(() => {
          dispatch(fetchFeedInfo(feedSourceId))
          dispatch(getGtfsTable('calendar', feedSourceId))
          dispatch(getGtfsTable('agency', feedSourceId))
        })
      }
      else {
        dispatch(fetchFeedInfo(feedSourceId))
        dispatch(getGtfsTable('calendar', feedSourceId))
        dispatch(getGtfsTable('agency', feedSourceId))
      }
      if (activeComponent) {
        dispatch(getGtfsTable(activeComponent, feedSourceId))
        //// FETCH trip patterns if route selected
        .then((entities) => {
          dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntity, subComponent, activeSubEntity, subSubComponent, activeSubSubEntity))
          if (activeComponent === 'route' && activeEntity) {
            dispatch(fetchTripPatternsForRoute(feedSourceId, activeEntity))
            .then((tripPatterns) => {
              console.log(tripPatterns)
              let pattern = tripPatterns && tripPatterns.find(p => p.id === activeSubEntity)
              console.log(pattern)
              if (subSubComponent === 'timetable' && activeSubSubEntity) {
                dispatch(fetchTripsForCalendar(feedSourceId, pattern, activeSubSubEntity))
              }
            })
            .then((tripPatterns) => {
              if (subComponent === 'trippattern' && activeSubEntity) {
                dispatch(fetchStopsForTripPattern(feedSourceId, activeSubEntity))
              }
            })
          }
        })
      }
      // if (initialProps.activeEntity) {
      //   dispatch(settingActiveGtfsEntity(feedSourceId, activeComponent, initialProps.activeEntity))
      // }
      // if (!initialProps.feedInfo) {
      //   dispatch(fetchFeedInfo(feedSourceId))
      //   dispatch(getGtfsTable('calendar', feedSourceId))
      // }
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
    deleteEntity: (feedSourceId, component, entity) => {
      dispatch(deleteGtfsEntity(feedSourceId, component, entity))
    },
    saveActiveEntity: (component) => {
      dispatch(saveActiveGtfsEntity(component))
      .then(entity => {
        // dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
      })
    },
    newEntityClicked: (feedSourceId, component, props) => {
      dispatch(newGtfsEntity(feedSourceId, component, props))
    },
    clearGtfsContent: () => {dispatch(clearGtfsContent())},
    fetchTripPatternsForRoute: (feedSourceId, routeId) => {
      dispatch(fetchTripPatternsForRoute(feedSourceId, routeId))
    },
    fetchStopsForTripPattern: (feedSourceId, tripPatternId) => {
      dispatch(fetchStopsForTripPattern(feedSourceId, tripPatternId))
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
