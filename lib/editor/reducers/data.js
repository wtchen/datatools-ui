import update from 'react-addons-update'
import clone from 'lodash.clonedeep'
import ll from '@conveyal/lonlat'
import SortDirection from 'react-virtualized/dist/commonjs/Table/SortDirection'

import {ENTITY} from '../constants'
import {defaultSorter} from '../../common/util/util'
import {COMPONENT_LIST, generateNullProps, getTableById, getKeyForId} from '../util/gtfs'
import {getMapToGtfsStrategy, entityIsNew} from '../util/objects'
import {assignDistancesToPatternStops, constructShapePoints} from '../util/map'

const defaultState = {
  active: {},
  tables: {
    agency: [],
    routes: [],
    stops: []
  },
  sort: {
    key: 'name',
    direction: SortDirection.ASC
  },
  status: {}
}
const data = (state = defaultState, action) => {
  let stateUpdate, key, subEntity, newState, routeIndex, stopIndex, patternIndex, activePattern
  const routes = getTableById(state.tables, 'route')
  const stops = getTableById(state.tables, 'stop')
  let activeTable
  if (action.payload) {
    activeTable = action.payload.component && action.payload.component !== 'trippattern' && getTableById(state.tables, action.payload.component, false)
  } else {
    activeTable = action.component && action.component !== 'trippattern' && getTableById(state.tables, action.component, false)
  }
  switch (action.type) {
    case 'RECEIVE_BASE_GTFS': {
      const feed = clone(action.payload.feed)
      if (feed.feed_info.length === 0) {
        console.warn(`No feed info found. Adding feed info with null values.`)
        feed.feed_info.push(generateNullProps('feedinfo'))
      }
      return update(state, {
        tables: {$set: feed}
      })
    }
    case 'SAVING_ACTIVE_GTFS_ENTITY':
      return update(state, {status: {
        savePending: {$set: true},
        saveSuccessful: {$set: false}
      }})
    case 'REQUESTING_FEED_INFO':
      if (state.feedSourceId && action.feedId !== state.feedSourceId) {
        return defaultState
      }
      return state
    case 'CREATE_GTFS_ENTITY': {
      let entity
      const id = ENTITY.NEW_ID
      if (action.component === 'trippattern') {
        entity = {
          isCreating: true,
          name: '',
          id,
          // feedId: action.feedSourceId,
          ...action.props
        }
        routeIndex = routes.findIndex(r => r.id === action.props.routeId)
        return update(newState || state, {
          tables: {route: {[routeIndex]: {tripPatterns: {$unshift: [entity]}}}},
          active: {
            entity: {tripPatterns: {$unshift: [entity]}}
          }
        })
      } else {
        entity = {
          isCreating: true,
          id,
          // feedId: action.feedSourceId,
          ...action.props
        }
        // if tables's component array is undefined, add it
        const comp = COMPONENT_LIST.find(c => c.id === action.component)
        if (!activeTable) {
          newState = update(state, {
            // FIXME: tableName is not defined
            tables: {[comp.tableName]: {$set: [entity]}}
          })
        }
        return update(newState || state, {
          tables: {[comp.tableName]: {$unshift: [entity]}}
        })
      }
    }
    case 'UPDATE_PATTERN_GEOMETRY': {
      const shapePoints = constructShapePoints(action.payload.controlPoints, action.payload.patternSegments)
      const patternStops = assignDistancesToPatternStops(state.active.subEntity.patternStops, shapePoints)
      console.log('new shape points and pattern stops', shapePoints, patternStops)
      return update(state, {
        active: {subEntity: {
          shapePoints: {$set: shapePoints}},
          patternStops: {$set: patternStops}
        }
      })
    }
    case 'SETTING_ACTIVE_GTFS_ENTITY': {
      const {component, entityId, feedSourceId, subComponent, subSubComponent, subEntityId, subSubEntityId} = action.payload
      const entity = (component === 'feedinfo')
        ? clone(activeTable)[0]
        : activeTable && entityId
        ? clone(activeTable.find(e => e.id === entityId))
        : null
      // Set edited to true if this is a new entity
      const edited = entity && entityIsNew(entity)
      switch (subComponent) {
        case 'trippattern':
          subEntity = entity && entity.tripPatterns
            ? clone(entity.tripPatterns.find(p => p.id === subEntityId))
            : null
          // if (subEntity) {
          //   subEntity.stops = clone(getStopsForPattern(subEntity, stops))
          // }
          break
      }
      const active = {
        feedSourceId,
        entity,
        entityId,
        subEntity,
        subEntityId,
        subSubEntityId,
        component,
        subComponent,
        subSubComponent,
        edited
      }
      return update(state, {
        active: {$set: active}
      })
    }
    case 'RESET_ACTIVE_GTFS_ENTITY': {
      switch (action.component) {
        case 'trippattern':
          const {tripPatterns} = state.active.entity
          patternIndex = tripPatterns.findIndex(p => p.id === action.entity.id)
          const pattern = Object.assign({}, tripPatterns[patternIndex])
          console.log('reset pattern from', state.active.subEntity, 'to', pattern)
          return update(state, {
            active: {
              subEntity: {$set: pattern},
              patternEdited: {$set: false}
            }
          })
        case 'feedinfo': {
          const entity = Object.assign({}, activeTable)
          return update(state, {
            active: {
              entity: {$set: entity},
              edited: {$set: false}
            }
          })
        }
        default: {
          const entity = activeTable.find(e => e.id === action.entity.id)
          return update(state, {
            active: {
              entity: {$set: entity},
              edited: {$set: false}
            }
          })
        }
      }
    }
    case 'SAVED_TRIP_PATTERN':
      const pattern = action.payload.tripPattern
      routeIndex = routes.findIndex(r => r.route_id === pattern.routeId)
      if (!state.active.entity) {
        console.warn('There is no active route in store for pattern.', state)
      }
      patternIndex = state.active.entity.tripPatterns.findIndex(p => p.id === pattern.id)
      stateUpdate = {active: {}}
      if (pattern.id === state.active.subEntityId) {
        // console.log('pattern is active')
        // if pattern is active, update active state.
        stateUpdate = {
          active: {
            subEntity: {$set: pattern},
            patternEdited: {$set: false}
          },
          status: {
            savePending: {$set: false},
            saveSuccessful: {$set: true}
          }
        }
      }
      // console.log(routes, pattern, routeIndex, patternIndex)
      if (patternIndex !== -1 && routeIndex !== -1) {
        // if pattern found in active route
        stateUpdate.tables = {routes:
          {[routeIndex]: {tripPatterns: {[patternIndex]: {$set: pattern}}}}
        }
        stateUpdate.active.entity = {tripPatterns:
          {[patternIndex]: {$set: pattern}}
        }
      } else if (pattern.routeId === state.active.entity.route_id) {
        // If pattern is brand new, push it into existing trip patterns array
        console.log('adding pattern to existing route')
        const patterns = clone(state.active.entity.tripPatterns)
        patterns.push(pattern)
        return update(state, {
          tables: {
            routes: {[routeIndex]: {tripPatterns: {$push: [pattern]}}}
          },
          active: {
            entity: {tripPatterns: {$set: patterns}}
          },
          status: {
            savePending: {$set: false},
            saveSuccessful: {$set: true}
          }
        })
      }
      return update(state, stateUpdate)
    case 'UPDATE_ACTIVE_GTFS_ENTITY': {
      let entity
      switch (action.component) {
        case 'trippattern':
          entity = Object.assign({}, state.active.subEntity)
          for (key in action.props) {
            entity[key] = action.props[key]
          }
          stateUpdate = {
            active: {
              subEntity: {$set: entity},
              patternEdited: {$set: true}
            }
          }
          return update(state, stateUpdate)
        default:
          entity = Object.assign({}, state.active.entity)
          for (key in action.props) {
            entity[key] = action.props[key]
          }
          return update(state, {
            active: {
              entity: {$set: entity},
              edited: {$set: true}
            }
          })
      }
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
    case 'RESNAP_STOPS':
      activePattern = state.active.subEntity
      if (activePattern) {
        const {patternStops} = activePattern
        return update(state, {
          active: { subEntity: {patternStops: {$set: patternStops.map(ps => {
            return {
              ...ps,
              shapeDistTraveled: null
            }
          })}}}
        })
      }
      return state
    // Handle trip patterns to be drawn as overlay layer in editor
    case 'RECEIVE_TRIP_PATTERNS':
      return update(state, {
        tripPatterns: {$set:
          // FIXME: Update for new trip pattern data structure
          action.payload.tripPatterns.map(pattern => {
            return {
              id: pattern.id,
              name: pattern.name,
              latLngs: pattern.shape ? (pattern.shape.coordinates.map(c => ll.fromCoordinates(c))) : null
            }
          })
        }
      })
    case 'DELETING_STOP':
      stopIndex = stops.findIndex(s => s.id === action.stop.id)
      return update(state, {
        // FIXME: table name
        tables: {stops: {$splice: [[stopIndex, 1]]}}
      })
    case 'CLEAR_GTFSEDITOR_CONTENT':
      return defaultState
    case 'RECEIVE_GTFS_ENTITIES': {
      const {data, editor, component} = action.payload
      if (!editor) {
        // Ignore entity fetches if not for the editor (i.e., fetching entities
        // for viewing validation result details).
        return state
      }
      const tableName = getKeyForId(component, 'tableName')
      // get entities from payload
      const mappingStrategy = getMapToGtfsStrategy(component)
      const entities = Object.assign({}, data.feed[tableName].map(mappingStrategy))
      const activeEntityId = action.payload.id || state.active.entity.id
      // Response should only contain a single entity if id argument is present
      const activeEntity = entities[0]
      const activeIndex = activeTable
        ? activeTable.findIndex(e => e.id === activeEntityId)
        : -1
      // Determine which entity to select
      // FIXME: this is so ugly...
      if (component === 'route' && activeEntity.tripPatterns) {
        // Find active pattern if component is route
        const {subEntityId} = state.active
        const tripPatterns = activeEntity.tripPatterns.sort(defaultSorter)
        // FIXME: what if we just request trip patterns (no route)
        // routeIndex = routes.findIndex(r => r.id === action.routeId)
        activePattern = subEntityId && tripPatterns.find(p => p.id === subEntityId)
      }
      let stateUpdate = {
        active: {
          entity: {$set: activeEntity},
          edited: {$set: false},
          subEntity: {$set: Object.assign({}, activePattern)},
          patternEdited: {$set: false}
        }
      }
      if (activeIndex !== -1) {
        // This entity already existed in the table (i.e., it is not new).
        stateUpdate.tables = {[tableName]: {[activeIndex]: {$set: activeEntity}}}
      } else {
        // This is a new entity.
        // FIXME What if this is the first entity?
        if (action.payload.replaceNew) {
          const replaceIndex = activeTable.findIndex(e => e.id === ENTITY.NEW_ID)
          console.log('replace index', replaceIndex)
          stateUpdate.tables = {[tableName]: {$splice: [[replaceIndex, 1, activeEntity]]}}
        } else {
          stateUpdate.tables = {[tableName]: {$push: [activeEntity]}}
        }
      }
      return update(state, stateUpdate)
    }
    case 'RECEIVE_GTFSEDITOR_TABLE': {
      const {component} = action.payload
      const mappingStrategy = getMapToGtfsStrategy(component)
      const tableName = getKeyForId(component, 'tableName')
      const entities = action.payload.entities.map(mappingStrategy)
      stateUpdate = {
        tables: {$merge:
          {[tableName]: entities}
        }
      }
      const {component: activeComponent, entity} = state.active
      if (entity && activeComponent === component) {
        // Update active entity if match is found
        const activeIndex = entities.findIndex(s => s.id === entity.id)
        if (activeIndex !== -1) {
          const activeEntity = clone(entities[activeIndex])
          if (entity.tripPatterns && component === 'route') {
            // clone trip patterns onto new active entity
            // FIXME: this should no longer be needed once we are using GraphQL properly
            activeEntity.tripPatterns = clone(entity.tripPatterns)
          }
          stateUpdate.active = {
            entity: {$set: activeEntity},
            edited: {$set: false}
          }
        }
      }
      return update(state, stateUpdate)
    }
    case 'TOGGLE_PATTERN_EDITING': {
      return update(state, {active: {patternSegment: {$set: undefined}}})
    }
    case 'UPDATE_ENTITY_SORT':
      return update(state, {sort: {$merge: action.payload}})
    case 'SET_ACTIVE_PATTERN_STOP':
      return update(state, {active: {patternStop: {$set: action.payload}}})
    case 'SET_ACTIVE_PATTERN_SEGMENT':
      return update(state, {active: {patternSegment: {$set: action.payload}}})
    default:
      return state
  }
}

export default data
