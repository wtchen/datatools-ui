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
  fetchTripPatterns,
  fetchTripPatternsForRoute
} from '../actions/tripPattern'
import {
  fetchTripsForCalendar,
  saveTripsForCalendar,
  deleteTripsForCalendar,
} from '../actions/trip'
import {
  setActiveGtfsEntity,
  newGtfsEntity,
  toggleEditGeometry,
  toggleAddStops,
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
  receiveGtfsEntities
} from '../actions/editor'

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
    : null
    // ownProps.routeParams.entity && state.editor.tableData[activeComponent]
    // ? state.editor.tableData[activeComponent].find(e => ownProps.routeParams.entity === e.id)
    // : null
  const entityEdited = state.editor.active.edited
  const isEditingGeometry = state.editor.editGeometry
  const isAddingStops = state.editor.addStops
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
    tripPatterns: state.editor.tripPatterns,
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
    activeEntityId,
    activeSubEntity,
    activeSubSubEntity,
    isAddingStops,
    isEditingGeometry,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log(ownProps)
  console.log(ownProps.location.pathname.split('/'))
  const feedSourceId = ownProps.routeParams.feedSourceId // location.pathname.split('/')[2]
  const activeComponent = ownProps.routeParams.subpage // location.pathname.split('/')[4]
  const subComponent = ownProps.routeParams.subsubpage // location.pathname.split('/')[5]
  const subSubComponent = ownProps.routeParams.subsubcomponent // location.pathname.split('/')[6]
  const activeEntityId = ownProps.routeParams.entity // location.pathname.split('/')[7]
  const activeSubEntity = ownProps.routeParams.subentity // location.pathname.split('/')[8]
  const activeSubSubEntity = ownProps.routeParams.subsubentity // location.pathname.split('/')[9]

  return {
    onComponentMount: (initialProps) => {
      const tablesToFetch = ['calendar', 'agency', 'route', 'stop']
      if (!initialProps.feedSource || feedSourceId !== initialProps.feedSource.id) {
        dispatch(fetchFeedSourceAndProject(feedSourceId))
        .then(() => {
          dispatch(fetchFeedInfo(feedSourceId))
        //   .then(() => {
        //     dispatch(getGtfsTable('calendar', feedSourceId))
        //     .then(() => {
        //       dispatch(getGtfsTable('agency', feedSourceId))
        //       .then(() => {
        //         dispatch(getGtfsTable('route', feedSourceId))
        //         .then(() => {
        //           dispatch(getGtfsTable('stop', feedSourceId))
        //         })
        //       })
        //     })
        //   })
        //
          dispatch(fetchFeedInfo(feedSourceId))
          for (var i = 0; i < tablesToFetch.length; i++) {
            if (tablesToFetch[i] !== activeComponent) {
              dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
            }
          }
          // dispatch(getGtfsTable('calendar', feedSourceId))
          // dispatch(getGtfsTable('agency', feedSourceId))
          // dispatch(getGtfsTable('route', feedSourceId))
          // dispatch(getGtfsTable('stop', feedSourceId))
        })
      } else {
        dispatch(fetchFeedInfo(feedSourceId))
        // .then(() => {
        //   dispatch(getGtfsTable('calendar', feedSourceId))
        //   .then(() => {
        //     dispatch(getGtfsTable('agency', feedSourceId))
        //     .then(() => {
        //       dispatch(getGtfsTable('route', feedSourceId))
        //       .then(() => {
        //         dispatch(getGtfsTable('stop', feedSourceId))
        //       })
        //     })
        //   })
        // })
        dispatch(fetchFeedInfo(feedSourceId))
        for (var i = 0; i < tablesToFetch.length; i++) {
          if (tablesToFetch[i] !== activeComponent) {
            dispatch(getGtfsTable(tablesToFetch[i], feedSourceId))
          }
        }
        // dispatch(getGtfsTable('calendar', feedSourceId))
        // dispatch(getGtfsTable('agency', feedSourceId))
        // dispatch(getGtfsTable('route', feedSourceId))
        // dispatch(getGtfsTable('stop', feedSourceId))
      }
      if (!activeComponent) {
        dispatch(clearGtfsContent())
      }
      else {
        dispatch(getGtfsTable(activeComponent, feedSourceId))
        //// FETCH trip patterns if route selected
        .then((entities) => {
          dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, activeSubEntity, subSubComponent, activeSubSubEntity))
          if (activeComponent === 'route' && activeEntityId) {
            dispatch(fetchTripPatternsForRoute(feedSourceId, activeEntityId))
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
      dispatch(fetchTripPatterns(feedSourceId))
    },
    onComponentUpdate: (prevProps, newProps) => {
      if (prevProps.activeComponent !== newProps.activeComponent)
        dispatch(setActiveGtfsEntity(feedSourceId, activeComponent, activeEntityId, subComponent, activeSubEntity, subSubComponent, activeSubSubEntity))
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
    toggleEditGeometry: () => {
      dispatch(toggleEditGeometry())
    },
    toggleAddStops: () => {
      dispatch(toggleAddStops())
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
    deleteEntity: (feedSourceId, component, entity) => {
      dispatch(deleteGtfsEntity(feedSourceId, component, entity))
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
