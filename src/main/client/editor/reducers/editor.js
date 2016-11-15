import update from 'react-addons-update'
import rbush from 'rbush'
import clone from 'clone'
import objectPath from 'object-path'
import { getControlPoints, getEntityBounds, stopToGtfs, routeToGtfs, agencyToGtfs, calendarToGtfs, fareToGtfs, gtfsSort } from '../util/gtfs'
import { latLngBounds } from 'leaflet'
import ll from 'lonlng'
import { CLICK_OPTIONS, getTimetableColumns } from '../util'

const defaultState = {
  feedSourceId: null,
  active: {},
  editSettings: {
    editGeometry: false,
    followStreets: true,
    onMapClick: CLICK_OPTIONS[0],
    stopInterval: 400,
    distanceFromIntersection: 5,
    afterIntersection: true,
    intersectionStep: 2,
    snapToStops: true,
    addStops: false,
    hideStops: false,
    controlPoints: [],
    coordinatesHistory: [],
    actions: []
  },
  timetable: {
    columns: [],
    trips: [],
    edited: [],
    selected: [],
    hideDepartureTimes: false,
    offset: null
  },
  mapState: {
    zoom: null,
    bounds: latLngBounds([[60, 60], [-60, -20]]),
    target: null
  },
  tableData: {},
  stopTree: null,
  validation: null
}
const editor = (state = defaultState, action) => {
  let stateUpdate, key, newTableData, fields, rowData, mappedEntities, activeEntity, activeSubEntity, newState, routeIndex, stopIndex, patternIndex, agencyIndex, fareIndex, calendarIndex, scheduleExceptionIndex, controlPoints, coordinates, mapState, activePattern, sortedTrips, columns, trips
  switch (action.type) {
    case 'REQUESTING_FEED_INFO':
      if (state.feedSourceId && action.feedId !== state.feedSourceId) {
        return defaultState
      }
      return state
    case 'UPDATE_MAP_SETTING':
      mapState = {...state.mapState}
      for (key in action.props) {
        mapState[key] = action.props[key]
      }
      if (!('target' in action.props)) {
        mapState.target = null
      }
      return update(state, {
        mapState: {$set: mapState}
      })
    case 'UPDATE_EDIT_SETTING':
      if (action.setting === 'editGeometry' && !state.editSettings.editGeometry) {
        controlPoints = getControlPoints(state.active.subEntity, state.editSettings.snapToStops)
        return update(state, {
          editSettings: {
            [action.setting]: {$set: action.value},
            controlPoints: {$set: [controlPoints]}
          }
        })
      } else {
        return update(state, {
          editSettings: {
            [action.setting]: {$set: action.value}
          }
        })
      }
    case 'UNDO_TRIP_PATTERN_EDITS':
      patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === state.active.subEntityId)
      let lastActionIndex = state.editSettings.actions.length - 1
      let lastActionType = state.editSettings.actions[lastActionIndex]
      let lastCoordinatesIndex = state.editSettings.coordinatesHistory.length - 1
      let lastControlPointsIndex = state.editSettings.controlPoints.length - 1
      stateUpdate = {
        editSettings: {
          // coordinatesHistory: {$splice: [[lastEditIndex, 1]]},
          // controlPoints: {$splice: [[lastEditIndex, 1]]},
          actions: {$splice: [[lastActionIndex, 1]]}
        }
      }
      switch (lastActionType) {
        case 'ADD_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          break
        case 'UPDATE_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.editSettings.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.editSettings.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              subEntity: {shape: {coordinates: {$set: coordinates}}}
            }
          }
          break
        case 'REMOVE_CONTROL_POINT':
          stateUpdate.editSettings.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.editSettings.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.editSettings.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              subEntity: {shape: {coordinates: {$set: coordinates}}}
            }
          }
          break
      }
      return update(state, stateUpdate)
    case 'ADD_CONTROL_POINT':
      controlPoints = [...state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]]
      controlPoints.splice(action.index, 0, action.controlPoint)
      return update(state, {
        editSettings: {
          controlPoints: {$push: [controlPoints]},
          actions: {$push: [action.type]}
        }
      })
    case 'REMOVE_CONTROL_POINT':
      controlPoints = [...state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]]
      controlPoints.splice(action.index, 1)
      return update(state, {
        editSettings: {
          controlPoints: {$push: [controlPoints]},
          actions: {$push: [action.type]}
        }
      })
    case 'UPDATE_CONTROL_POINT':
      let newControlPoints = []
      controlPoints = state.editSettings.controlPoints[state.editSettings.controlPoints.length - 1]
      for (var i = 0; i < controlPoints.length; i++) {
        newControlPoints.push(Object.assign({}, controlPoints[i]))
      }
      let newest = update(newControlPoints, {[action.index]: {point: {$set: action.point}, distance: {$set: action.distance}}})
      return update(state, {
        editSettings: {
          controlPoints: {$push: [newest]},
          actions: {$push: [action.type]}
        }
      })
    case 'RECEIVED_ROUTES_SHAPEFILE':
      return update(state, {
        mapState: {
          routesGeojson: {$set: action.geojson}
        }
      })
    case 'CREATE_GTFS_ENTITY':
      if (action.component === 'trippattern') {
        activeEntity = {
          isCreating: true,
          name: '',
          id: 'new',
          feedId: action.feedSourceId,
          ...action.props
        }
        routeIndex = state.tableData.route.findIndex(r => r.id === action.props.routeId)
        return update(newState || state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {$unshift: [activeEntity]}}}},
          active: {
            entity: {tripPatterns: {$unshift: [activeEntity]}}
            // edited: {$set: typeof action.props !== 'undefined'}
          }
        })
      } else {
        activeEntity = {
          isCreating: true,
          name: '',
          id: 'new',
          feedId: action.feedSourceId,
          ...action.props
        }
        // if tableData's component array is undefined, add it
        if (!state.tableData[action.component]) {
          newState = update(state, {
            tableData: {[action.component]: {$set: []}}
          })
        }
        return update(newState || state, {
          tableData: {[action.component]: {$unshift: [activeEntity]}}
          // active: {
          //   entity: {$set: activeEntity},
          //   edited: {$set: typeof action.props !== 'undefined'}
          // }
        })
      }
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      activeEntity = action.component === 'feedinfo'
        ? clone(state.tableData[action.component])
        : state.tableData[action.component] && action.entityId
        ? clone(state.tableData[action.component].find(e => e.id === action.entityId))
        : null
      switch (action.subComponent) {
        case 'trippattern':
          activeSubEntity = activeEntity && activeEntity.tripPatterns
            ? clone(activeEntity.tripPatterns.find(p => p.id === action.subEntityId))
            : null
          controlPoints = getControlPoints(activeSubEntity, state.editSettings.snapToStops)
          coordinates = activeSubEntity && activeSubEntity.shape && activeSubEntity.shape.coordinates

          // set timetable trips (if in timetable editor)
          if (action.subSubComponent === 'timetable' && activeSubEntity) {
            routeIndex = state.tableData.route.findIndex(r => r.id === action.entityId)
            patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.subEntityId)
            activePattern = clone(state.tableData.route[routeIndex].tripPatterns[patternIndex])
            trips = clone(activePattern[action.subSubEntityId])
            sortedTrips = trips
              ? trips.filter(t => t.useFrequency === activePattern.useFrequency) // filter out based on useFrequency
              .sort((a, b) => {
                if (a.stopTimes[0].departureTime < b.stopTimes[0].departureTime) return -1
                if (a.stopTimes[0].departureTime > b.stopTimes[0].departureTime) return 1
                return 0
              })
              : []
            columns = getTimetableColumns(activePattern, state.tableData.stop, state.timetable.hideDepartureTimes)
            return update(state, {
              timetable: {
                trips: {$set: sortedTrips},
                columns: {$set: columns},
                edited: {$set: []},
                selected: {$set: []}
              }
            })
          }
          break
      }
      let active = {
        feedSourceId: action.feedSourceId,
        entity: activeEntity,
        entityId: action.entityId,
        subEntity: activeSubEntity,
        subEntityId: action.subEntityId,
        component: action.component,
        subComponent: action.subComponent,
        subSubComponent: action.subSubComponent,
        edited: activeEntity && activeEntity.id === 'new'
      }
      stateUpdate = {
        editSettings: {
          controlPoints: {$set: controlPoints}
        },
        active: {$set: active}
      }
      if (coordinates) {
        stateUpdate.coordinatesHistory = {$set: [coordinates]}
      }
      return update(state, stateUpdate)
    case 'RESET_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.entity.id)
          activeEntity = Object.assign({}, state.active.entity.tripPatterns[patternIndex])
          return update(state, {
            active: {
              subEntity: {$set: activeEntity},
              patternEdited: {$set: false}
            }
          })
        case 'feedinfo':
          activeEntity = Object.assign({}, state.tableData[action.component])
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            }
          })
        default:
          activeEntity = state.tableData[action.component].find(e => e.id === action.entity.id)
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            }
          })
      }
    case 'SAVED_TRIP_PATTERN':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.tripPattern.routeId)
      patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.tripPattern.id)
      stateUpdate = {active: {}}

      // if pattern is active
      if (action.tripPattern.id === state.active.subEntityId) {
        // set controlPoints initially and then whenever isSnappingToStops changes
        controlPoints = getControlPoints(action.tripPattern, state.editSettings.snapToStops)

        stateUpdate = {
          active: {
            subEntity: {$set: action.tripPattern},
            patternEdited: {$set: false}
          },
          editSettings: {controlPoints: {$set: [controlPoints]}}
        }
      }
      // if not active, but present in active route
      if (patternIndex !== -1) {
        stateUpdate.tableData = {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$set: action.tripPattern}}}}}
        stateUpdate.active.entity = {tripPatterns: {[patternIndex]: {$set: action.tripPattern}}}
      } else if (action.tripPattern.routeId === state.active.entity.id) { // if pattern is entirely new
        const patterns = clone(state.active.entity.tripPatterns)
        patterns.push(action.tripPattern)
        return update(state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {$push: [action.tripPattern]}}}},
          // active: {entity: {tripPatterns: {$push: [action.tripPattern]}}}
          active: {entity: {tripPatterns: {$set: patterns}}}
        })
      }
      return update(state, stateUpdate)
    case 'UPDATE_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.entity.id)
          activeEntity = Object.assign({}, state.active.subEntity)
          for (key in action.props) {
            activeEntity[key] = action.props[key]
          }
          stateUpdate = {
            active: {
              // entity: {tripPatterns: {[patternIndex]: {$set: activeEntity}}},
              subEntity: {$set: activeEntity},
              patternEdited: {$set: true}
            }
          }
          if (action.props && 'shape' in action.props) {
            // add previous coordinates to history
            // stateUpdate.editSettings = {coordinatesHistory: {$push: [action.props.shape.coordinates]}}
            coordinates = state.active.subEntity.shape && state.active.subEntity.shape.coordinates
            if (coordinates)
              stateUpdate.editSettings = {coordinatesHistory: {$push: [coordinates]}}
          }
          return update(state, stateUpdate)
        // case 'feedinfo':
          // activeEntity = Object.assign({}, state.active.entity)
        // case 'timetable':
        //   activeEntity = Object.assign({}, state.active.entity)
        //   patternIndex = activeEntity.tripPatterns.findIndex(p => p.id === action.entity.id)
        //   for (key in action.props) {
        //     activeEntity.tripPatterns[patternIndex][key] = action.props[key]
        //   }
        //   return update(state, {
        //     active: {entity: {$set: activeEntity}},
        //     edited: {$set: true}
        //   })
        default:
          activeEntity = Object.assign({}, state.active.entity)
          for (key in action.props) {
            activeEntity[key] = action.props[key]
          }
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: true}
            },
          })
      }
    case 'RECEIVE_AGENCIES':
      const agencies = action.agencies.map(agencyToGtfs)
      agencies.sort(gtfsSort)
      agencyIndex = state.active.entity && agencies.findIndex(a => a.id === state.active.entity.id)
      if (agencyIndex !== -1) {
        return update(state, {
          tableData: {agency: {$set: agencies}},
          active: {
            entity: {$set: agencies[agencyIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {agency: {$set: agencies}}
        })
      }
    case 'RECEIVE_FARES':
      const fares = action.fares.map(fareToGtfs)
      fares.sort(gtfsSort)
      fareIndex = state.active.entity && fares.findIndex(f => f.id === state.active.entity.id)
      if (fareIndex !== -1) {
        return update(state, {
          tableData: {fare: {$set: fares}},
          active: {
            entity: {$set: fares[fareIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {fare: {$set: fares}}
        })
      }
    case 'RECEIVE_FEED_INFO':
      const feedInfo = action.feedInfo
        ? {
          // datatools props
          id: action.feedInfo.id,
          color: action.feedInfo.color,
          defaultLat: action.feedInfo.defaultLat,
          defaultLon: action.feedInfo.defaultLon,
          defaultRouteType: action.feedInfo.defaultRouteType,

          // gtfs spec props
          feed_end_date: action.feedInfo.feedEndDate,
          feed_start_date: action.feedInfo.feedStartDate,
          feed_lang: action.feedInfo.feedLang,
          feed_publisher_name: action.feedInfo.feedPublisherName,
          feed_publisher_url: action.feedInfo.feedPublisherUrl,
          feed_version: action.feedInfo.feedVersion
        }
        : {
          // datatools props
          id: null,
          color: null,
          defaultLat: null,
          defaultLon: null,
          defaultRouteType: null,

          // gtfs spec props
          feed_end_date: null,
          feed_start_date: null,
          feed_lang: null,
          feed_publisher_name: null,
          feed_publisher_url: null,
          feed_version: null
        }
      let mapState = {...state.mapState}
      if (feedInfo && feedInfo.defaultLon && feedInfo.defaultLat) {
        mapState.bounds = getEntityBounds([feedInfo.defaultLon, feedInfo.defaultLat], 0.5)
        mapState.target = feedInfo.id
      }

      if (state.active.component === 'feedinfo') {
        return update(state, {
          tableData: {feedinfo: {$set: feedInfo}},
          active: {
            entity: {$set: feedInfo},
            edited: {$set: false}
          },
          mapState: {$set: mapState}
        })
      } else {
        return update(state, {
          tableData: {feedinfo: {$set: feedInfo}},
          mapState: {$set: mapState}
        })
      }
    case 'RECEIVE_CALENDARS':
      const calendars = action.calendars ? action.calendars.map(calendarToGtfs) : null
      calendars.sort(gtfsSort)
      calendarIndex = state.active.entity && calendars.findIndex(c => c.id === state.active.entity.id)
      if (calendarIndex !== -1) {
        return update(state, {
          tableData: {calendar: {$set: calendars}},
          active: {
            entity: {$set: calendars[calendarIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {calendar: {$set: calendars}}
        })
      }
    case 'RECEIVE_SCHEDULE_EXCEPTIONS':
      const scheduleExceptions = action.scheduleExceptions ? action.scheduleExceptions.map(se => {
        return {
          // datatools props
          id: se.id,
          name: se.name,
          feedId: se.feedId,
          exemplar: se.exemplar,
          dates: se.dates,
          customSchedule: se.customSchedule,
          addedService: se.addedService,
          removedService: se.removedService

          // gtfs spec props
          // gtfs_prop: se.gtfs_prop
        }
      }) : []
      scheduleExceptionIndex = state.active.entity && action.scheduleExceptions.findIndex(se => se.id === state.active.entity.id)
      if (scheduleExceptionIndex !== -1) {
        return update(state, {
          tableData: {scheduleexception: {$set: scheduleExceptions}},
          active: {
            entity: {$set: scheduleExceptions[scheduleExceptionIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {scheduleexception: {$set: scheduleExceptions}}
        })
      }
    case 'RECEIVE_ROUTES':
      const routes = action.routes ? action.routes.map(routeToGtfs) : []
      routes.sort(gtfsSort)
      // feedTableData.route = routes
      routeIndex = state.active.entity && routes.findIndex(r => r.id === state.active.entity.id)
      if (routeIndex !== -1) {
        let activeRoute = routes[routeIndex]
        if (state.active.entity && state.active.entity.tripPatterns) {
          activeRoute.tripPatterns = clone(state.active.entity.tripPatterns)
        }
        let followStreets = activeRoute ? activeRoute.route_type === 3 || activeRoute.route_type === 0 : true
        return update(state, {
          tableData: {route: {$set: routes}},
          active: {
            entity: {$set: activeRoute},
            edited: {$set: false}
          },
          editSettings: {
            followStreets: {$set: followStreets}
          }
        })
      } else {
        return update(state, {
          tableData: {route: {$set: routes}}
        })
      }
    case 'RECEIVE_TRIP_PATTERNS':
      return update(state, {
        tripPatterns: {$set:
          Object.keys(action.tripPatterns).map(key => {
            return {
              id: key,
              latLngs: action.tripPatterns[key].shape ? (action.tripPatterns[key].shape.coordinates.map(c => ll.fromCoordinates(c))) : null
            }
          })
        }
      })
    case 'RECEIVE_TRIP_PATTERNS_FOR_ROUTE':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.routeId)
      activePattern = state.active.subEntityId && action.tripPatterns.find(p => p.id === state.active.subEntityId)
      if (routeIndex === -1) {
        return state
      }
      // set controlPoints initially and then whenever isSnappingToStops changes
      if (activePattern) {
        controlPoints = getControlPoints(activePattern, state.editSettings.snapToStops)
      } else {
        controlPoints = []
      }
      if (state.active.entity.id === action.routeId) {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}},
          active: {
            entity: {$merge: {tripPatterns: action.tripPatterns}},
            subEntity: {$set: Object.assign({}, activePattern)}
          },
          editSettings: {controlPoints: {$set: [controlPoints]}}
        })
      } else {
        return update(state, {
          tableData: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}}
        })
      }
    case 'SET_TIMETABLE_OFFSET':
      return update(state, {
        timetable: {
          offset: {$set: action.seconds}
        }
      })
    case 'UPDATE_TIMETABLE_CELL_VALUE':
      trips = clone(state.timetable.trips)
      objectPath.set(trips, action.key, action.value)
      return update(state, {
        timetable: {
          trips: {$set: trips},
          edited: {$push: [action.rowIndex]}
        }
      })
    case 'TOGGLE_ALL_TIMETABLE_ROW_SELECTION':
      let selected = []
      if (action.select) {
        for (let i = 0; i < state.timetable.trips.length; i++) {
          selected.push(i)
        }
      }
      return update(state, {
        timetable: {
          selected: {$set: selected}
        }
      })
    case 'TOGGLE_DEPARTURE_TIMES':
      return update(state, {
        timetable: {
          hideDepartureTimes: {$set: !state.timetable.hideDepartureTimes}
        }
      })
    case 'ADD_NEW_TRIP':
      return update(state, {
        timetable: {
          trips: {$push: [action.trip]},
          edited: {$push: [state.timetable.trips.length]}
        }
      })
    case 'TOGGLE_SINGLE_TIMETABLE_ROW_SELECTION':
      let selectIndex = state.timetable.selected.indexOf(action.rowIndex)
      if (selectIndex === -1) {
        return update(state, {
          timetable: {
            selected: {$push: [action.rowIndex]}
          }
        })
      }
      else {
        return update(state, {
          timetable: {
            selected: {$splice: [[selectIndex, 1]]}
          }
        })
      }
    case 'RECEIVE_TRIPS_FOR_CALENDAR':
      routeIndex = state.tableData.route.findIndex(r => r.id === action.pattern.routeId)
      patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
      activePattern = clone(state.tableData.route[routeIndex].tripPatterns[patternIndex])
      trips = clone(action.trips)
      sortedTrips = trips
        ? action.trips.filter(t => t.useFrequency === activePattern.useFrequency) // filter out based on useFrequency
        .sort((a, b) => {
          // if(a.isCreating && !b.isCreating) return -1
          // if(!a.isCreating && b.isCreating) return 1
          if (a.stopTimes[0].departureTime < b.stopTimes[0].departureTime) return -1
          if (a.stopTimes[0].departureTime > b.stopTimes[0].departureTime) return 1
          return 0
        })
        : []
      columns = getTimetableColumns(activePattern, state.tableData.stop, state.timetable.hideDepartureTimes)
      if (state.active.entity.id === action.pattern.routeId) {
        return update(state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
          active: {entity: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}},
          timetable: {
            trips: {$set: sortedTrips},
            patternId: {$set: activePattern.id},
            calendarId: {$set: action.calendarId},
            columns: {$set: columns},
            edited: {$set: []}
          }
        })
      }
      else {
        return update(state, {
          tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
        })
      }
    // case 'DELETED_TRIPS_FOR_CALENDAR':
    //   routeIndex = state.tableData.route.findIndex(r => r.id === action.pattern.routeId)
    //   patternIndex = state.tableData.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
    //   let tripIndex = state.tableData.route[routeIndex].tripPatterns[patternIndex][action.calendarId].findIndex(t => t.)
    //   if (state.active.entity.id === action.pattern.routeId) {
    //     return update(state, {
    //       tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
    //       active: {entity: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}
    //     })
    //   }
    //   else {
    //     return update(state, {
    //       tableData: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
    //     })
    //   }
    case 'RECEIVE_STOPS':
      const stops = action.stops ? action.stops.map(stopToGtfs) : []
      stops.sort(gtfsSort)
      const tree = rbush(9, ['[0]', '[1]', '[0]', '[1]'])
      tree.load(stops.map(s => ([s.stop_lon, s.stop_lat, s])))
      stopIndex = state.active.entity && stops.findIndex(s => s.id === state.active.entity.id)
      if (stopIndex !== -1) {
        return update(state, {
          tableData: {stop: {$set: stops}},
          stopTree: {$set: tree},
          active: {
            entity: {$set: stops[stopIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tableData: {stop: {$set: stops}},
          stopTree: {$set: tree}
        })
      }
    case 'DELETING_STOP':
      stopIndex = state.tableData.stop.findIndex(s => s.id === action.stop.id)
      return update(state, {
        tableData: {stop: {$splice: [[stopIndex, 1]]}}
      })
    case 'RECEIVE_STOP':
      const stop = stopToGtfs(action.stop)
      stopIndex = state.tableData.stop.findIndex(s => s.id === stop.id)

      // TODO: handle adding to rbush tree
      // TODO: updated sort with stops array

      // if stop is active, update active entity
      if (stop.id === state.active.entityId && stopIndex !== -1) {
        stateUpdate = {
          tableData: {stop: {[stopIndex]: {$set: stop}}},
          active: {
            entity: {$set: stop},
            edited: {$set: false}
          }
        }
      } else if (stopIndex === -1) {
        stateUpdate = {
          tableData: {stop: {$push: [stop]}}
        }
      } else {
        stateUpdate = {
          tableData: {stop: {[stopIndex]: {$set: stop}}}
        }
      }
      return update(state, stateUpdate)
    case 'CLEAR_GTFSEDITOR_CONTENT':
      return defaultState
    case 'RECEIVE_GTFSEDITOR_TABLE':
      newTableData = {}
      const getMappedEntities = (entities) => {
        switch (action.tableId) {
          case 'agency':
            return action.entities.map(agencyToGtfs)
          case 'route':
            return action.entities.map(routeToGtfs)
          case 'stop':
            return action.entities.map(stopToGtfs)
          case 'calendar':
            return action.entities.map(calendarToGtfs)
          case 'fare':
            return action.entities.map(fareToGtfs) // no mapping exists for fares
          default:
            return action.entities
        }
      }

      newTableData[action.tableId] = getMappedEntities(action.entities)

      return update(state, {
        tableData: {$merge: newTableData}
      })
    case 'RECEIVE_GTFSEDITOR_CONTENT':
      newTableData = {}
      for(let i = 0; i < action.filenames.length; i++) {
        const lines = action.fileContent[i].split('\n')
        if(lines.length < 2) continue
        fields = lines[0].split(',')
        newTableData[action.filenames[i].split('.')[0]] = lines.slice(1)
          .filter(line => line.split(',').length === fields.length)
          .map((line, rowIndex) => {
            const values = line.split(',')
            rowData = { origRowIndex: rowIndex }
            for(let f = 0; f < fields.length; f++) {
              rowData[fields[f]] = values[f]
            }
            return rowData
          })
      }
      return update(state, {
        feedSourceId: {$set: action.feedSourceId},
        tableData: {$set: newTableData}
      })

    case 'ADD_GTFSEDITOR_ROW':
      // create this table if it doesn already exist
      if(!(action.tableId in state.tableData)) {
        return update(state,
          {tableData:
            {$merge: {[action.tableId]: [action.rowData]} }
          }
        )
      }
      // otherwise, add it to the exising table
      return update(state,
        {tableData:
          {[action.tableId]:
            {$push: [action.rowData]}
          }
        }
      )

    case 'UPDATE_GTFSEDITOR_FIELD':
      return update(state,
        {tableData:
          {[action.tableId]:
            {[action.rowIndex]:
              {[action.fieldName]:
                {$set: action.newValue}
              }
            }
          }
        }
      )

    case 'DELETE_GTFSEDITOR_ROW':
      const table = state.tableData[action.tableId]
      const newTable = [
        ...table.slice(0, action.rowIndex),
        ...table.slice(action.rowIndex + 1)
      ]
      return update(state,
        {tableData:
          {[action.tableId]:
            {$set: newTable}
          }
        }
      )

    case 'RECEIVE_GTFS_ENTITIES':
      const getType = function (entity) {
        if (entity.hasOwnProperty('route_id')) return 'route'
        if (entity.hasOwnProperty('stop_id')) return 'stop'
      }

      const newLookupEntries = {}
      for(const entity of action.gtfsEntities) {
        const type = getType(entity)
        const key = type + '_' + entity[type+'_id']
        newLookupEntries[key] = entity
      }

      return update(state,
        {gtfsEntityLookup:
          {$merge: newLookupEntries}
        }
      )

    case 'RECEIVE_GTFSEDITOR_VALIDATION':
      const validationTable = {}
      for (const issue of action.validationIssues) {
        if (!(issue.tableId in validationTable)) {
          validationTable[issue.tableId] = []
        }
        validationTable[issue.tableId].push(issue)
      }
      return update(state,
        {validation:
          {$set: validationTable}
        }
      )

    default:
      return state
  }
}

export default editor
