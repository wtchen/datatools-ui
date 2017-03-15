import update from 'react-addons-update'
import clone from 'lodash.clonedeep'
import ll from '@conveyal/lonlat'

import { stopToGtfs, routeToGtfs, agencyToGtfs, calendarToGtfs, fareToGtfs, gtfsSort } from '../util/gtfs'
import { getStopsForPattern } from '../util'

const defaultState = {
  active: {},
  tables: {}
}
const data = (state = defaultState, action) => {
  let stateUpdate, key, newTableData, activeEntity, activeSubEntity, newState, routeIndex, stopIndex, patternIndex, agencyIndex, fareIndex, calendarIndex, scheduleExceptionIndex, activePattern
  const { type, component } = action
  switch (type) {
    case 'REQUESTING_FEED_INFO':
      if (state.feedSourceId && action.feedId !== state.feedSourceId) {
        return defaultState
      }
      return state
    case 'CREATE_GTFS_ENTITY':
      if (component === 'trippattern') {
        activeEntity = {
          isCreating: true,
          name: '',
          id: 'new',
          feedId: action.feedSourceId,
          ...action.props
        }
        routeIndex = state.tables.route.findIndex(r => r.id === action.props.routeId)
        return update(newState || state, {
          tables: {route: {[routeIndex]: {tripPatterns: {$unshift: [activeEntity]}}}},
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
        // if tables's component array is undefined, add it
        if (!state.tables[component]) {
          newState = update(state, {
            tables: {[component]: {$set: []}}
          })
        }
        return update(newState || state, {
          tables: {[component]: {$unshift: [activeEntity]}}
          // active: {
          //   entity: {$set: activeEntity},
          //   edited: {$set: typeof action.props !== 'undefined'}
          // }
        })
      }
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      activeEntity = component === 'feedinfo'
        ? clone(state.tables[component])
        : state.tables[component] && action.entityId
        ? clone(state.tables[component].find(e => e.id === action.entityId))
        : null
      switch (action.subComponent) {
        case 'trippattern':
          activeSubEntity = activeEntity && activeEntity.tripPatterns
            ? clone(activeEntity.tripPatterns.find(p => p.id === action.subEntityId))
            : null
          if (activeSubEntity) {
            activeSubEntity.stops = clone(getStopsForPattern(activeSubEntity, state.tables.stop))
          }
          break
      }
      const active = {
        feedSourceId: action.feedSourceId,
        entity: activeEntity,
        entityId: action.entityId,
        subEntity: activeSubEntity,
        subEntityId: action.subEntityId,
        subSubEntityId: action.subSubEntityId,
        component: component,
        subComponent: action.subComponent,
        subSubComponent: action.subSubComponent,
        edited: activeEntity && activeEntity.id === 'new'
      }
      return update(state, {
        active: {$set: active}
      })
    case 'RESET_ACTIVE_GTFS_ENTITY':
      switch (component) {
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
          activeEntity = Object.assign({}, state.tables[component])
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            }
          })
        default:
          activeEntity = state.tables[component].find(e => e.id === action.entity.id)
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: false}
            }
          })
      }
    case 'SAVED_TRIP_PATTERN':
      routeIndex = state.tables.route.findIndex(r => r.id === action.tripPattern.routeId)
      patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.tripPattern.id)
      stateUpdate = {active: {}}

      // if pattern is active
      if (action.tripPattern.id === state.active.subEntityId) {
        stateUpdate = {
          active: {
            subEntity: {$set: action.tripPattern},
            patternEdited: {$set: false}
          }
        }
      }
      // if not active, but present in active route
      if (patternIndex !== -1) {
        stateUpdate.tables = {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$set: action.tripPattern}}}}}
        stateUpdate.active.entity = {tripPatterns: {[patternIndex]: {$set: action.tripPattern}}}
      } else if (action.tripPattern.routeId === state.active.entity.id) { // if pattern is entirely new
        const patterns = clone(state.active.entity.tripPatterns)
        patterns.push(action.tripPattern)
        return update(state, {
          tables: {route: {[routeIndex]: {tripPatterns: {$push: [action.tripPattern]}}}},
          active: {entity: {tripPatterns: {$set: patterns}}}
        })
      }
      return update(state, stateUpdate)
    case 'UPDATE_ACTIVE_GTFS_ENTITY':
      switch (component) {
        case 'trippattern':
          patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === action.entity.id)
          activeEntity = Object.assign({}, state.active.subEntity)
          for (key in action.props) {
            activeEntity[key] = action.props[key]
          }
          stateUpdate = {
            active: {
              subEntity: {$set: activeEntity},
              patternEdited: {$set: true}
            }
          }
          return update(state, stateUpdate)
        default:
          activeEntity = Object.assign({}, state.active.entity)
          for (key in action.props) {
            activeEntity[key] = action.props[key]
          }
          return update(state, {
            active: {
              entity: {$set: activeEntity},
              edited: {$set: true}
            }
          })
      }
    case 'RECEIVE_AGENCIES':
      const agencies = action.agencies.map(agencyToGtfs)
      agencies.sort(gtfsSort)
      agencyIndex = state.active.entity && agencies.findIndex(a => a.id === state.active.entity.id)
      if (agencyIndex !== -1) {
        return update(state, {
          tables: {agency: {$set: agencies}},
          active: {
            entity: {$set: agencies[agencyIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {agency: {$set: agencies}}
        })
      }
    case 'RECEIVE_FARES':
      const fares = action.fares.map(fareToGtfs)
      fares.sort(gtfsSort)
      fareIndex = state.active.entity && fares.findIndex(f => f.id === state.active.entity.id)
      if (fareIndex !== -1) {
        return update(state, {
          tables: {fare: {$set: fares}},
          active: {
            entity: {$set: fares[fareIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {fare: {$set: fares}}
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
      if (state.active.component === 'feedinfo') {
        return update(state, {
          tables: {feedinfo: {$set: feedInfo}},
          active: {
            entity: {$set: feedInfo},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {feedinfo: {$set: feedInfo}}
        })
      }
    case 'RECEIVE_CALENDARS':
      const calendars = action.calendars ? action.calendars.map(calendarToGtfs) : null
      calendars.sort(gtfsSort)
      calendarIndex = state.active.entity && calendars.findIndex(c => c.id === state.active.entity.id)
      if (calendarIndex !== -1) {
        return update(state, {
          tables: {calendar: {$set: calendars}},
          active: {
            entity: {$set: calendars[calendarIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {calendar: {$set: calendars}}
        })
      }
    case 'RECEIVE_SCHEDULE_EXCEPTIONS':
      const scheduleExceptions = action.scheduleExceptions || [] // no mapping required
      scheduleExceptionIndex = state.active.entity && action.scheduleExceptions.findIndex(se => se.id === state.active.entity.id)
      if (scheduleExceptionIndex !== -1) {
        return update(state, {
          tables: {scheduleexception: {$set: scheduleExceptions}},
          active: {
            entity: {$set: scheduleExceptions[scheduleExceptionIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {scheduleexception: {$set: scheduleExceptions}}
        })
      }
    case 'RECEIVE_ROUTES':
      const routes = action.routes ? action.routes.map(routeToGtfs) : []
      routes.sort(gtfsSort)
      routeIndex = state.active.entity && routes.findIndex(r => r.id === state.active.entity.id)
      if (routeIndex !== -1) {
        const activeRoute = routes[routeIndex]
        if (state.active.entity && state.active.entity.tripPatterns) {
          activeRoute.tripPatterns = clone(state.active.entity.tripPatterns)
        }
        return update(state, {
          tables: {route: {$set: routes}},
          active: {
            entity: {$set: activeRoute},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {route: {$set: routes}}
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
      routeIndex = state.tables.route.findIndex(r => r.id === action.routeId)
      activePattern = state.active.subEntityId && action.tripPatterns.find(p => p.id === state.active.subEntityId)
      if (activePattern) {
        activePattern.stops = getStopsForPattern(activePattern, state.tables.stop)
      }
      if (routeIndex === -1) {
        return state
      }
      if (state.active.entity.id === action.routeId) {
        return update(state, {
          tables: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}},
          active: {
            entity: {$merge: {tripPatterns: action.tripPatterns}},
            subEntity: {$set: Object.assign({}, activePattern)}
          }
        })
      } else {
        return update(state, {
          tables: {route: {[routeIndex]: {$merge: {tripPatterns: action.tripPatterns}}}}
        })
      }
    // case 'RECEIVE_TRIPS_FOR_CALENDAR':
    //   routeIndex = state.tables.route.findIndex(r => r.id === action.pattern.routeId)
    //   patternIndex = state.tables.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
    //   // if (state.active.entity.id === action.pattern.routeId) {
    //     return update(state, {
    //       tables: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
    //       active: {entity: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}
    //     })
    //   // } else {
    //   //   return update(state, {
    //   //     tables: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}}
    //   //   })
    //   // }
    // case 'DELETED_TRIPS_FOR_CALENDAR':
    //   routeIndex = state.tables.route.findIndex(r => r.id === action.pattern.routeId)
    //   patternIndex = state.tables.route[routeIndex].tripPatterns.findIndex(p => p.id === action.pattern.id)
    //   let tripIndex = state.tables.route[routeIndex].tripPatterns[patternIndex][action.calendarId].findIndex(t => t.)
    //   if (state.active.entity.id === action.pattern.routeId) {
    //     return update(state, {
    //       tables: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
    //       active: {entity: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}
    //     })
    //   }
    //   else {
    //     return update(state, {
    //       tables: {route: {[routeIndex]: {tripPatterns: {[patternIndex]: {$merge: {[action.calendarId]: action.trips}}}}}},
    //     })
    //   }
    case 'RECEIVE_STOPS':
      const stops = action.stops ? action.stops.map(stopToGtfs) : []
      stops.sort(gtfsSort)
      stopIndex = state.active.entity && stops.findIndex(s => s.id === state.active.entity.id)
      if (stopIndex !== -1) {
        return update(state, {
          tables: {stop: {$set: stops}},
          active: {
            entity: {$set: stops[stopIndex]},
            edited: {$set: false}
          }
        })
      } else {
        return update(state, {
          tables: {stop: {$set: stops}}
        })
      }
    case 'DELETING_STOP':
      stopIndex = state.tables.stop.findIndex(s => s.id === action.stop.id)
      return update(state, {
        tables: {stop: {$splice: [[stopIndex, 1]]}}
      })
    case 'RECEIVE_STOP':
      const stop = stopToGtfs(action.stop)
      if (!stop) {
        return state
      }
      stopIndex = state.tables.stop.findIndex(s => s.id === stop.id)

      // TODO: handle adding to rbush tree
      // TODO: updated sort with stops array

      // if stop is active, update active entity
      if (stop.id === state.active.entityId && stopIndex !== -1) {
        stateUpdate = {
          tables: {stop: {[stopIndex]: {$set: stop}}},
          active: {
            entity: {$set: stop},
            edited: {$set: false}
          }
        }
      } else if (stopIndex === -1) {
        stateUpdate = {
          tables: {stop: {$push: [stop]}}
        }
      } else {
        stateUpdate = {
          tables: {stop: {[stopIndex]: {$set: stop}}}
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
        tables: {$merge: newTableData}
      })
    case 'RECEIVE_GTFS_ENTITIES':
      const getType = function (entity) {
        if (entity.hasOwnProperty('route_id')) return 'route'
        if (entity.hasOwnProperty('stop_id')) return 'stop'
      }
      const newLookupEntries = {}
      for (const entity of action.gtfsEntities) {
        const type = getType(entity)
        const key = type + '_' + entity[type + '_id']
        newLookupEntries[key] = entity
      }
      return update(state,
        {gtfsEntityLookup:
          {$merge: newLookupEntries}
        }
      )
    default:
      return state
  }
}

export default data
