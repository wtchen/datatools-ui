import update from 'react-addons-update'
import clone from 'lodash.clonedeep'
import SortDirection from 'react-virtualized/dist/commonjs/Table/SortDirection'

import {ENTITY} from '../constants'
import {defaultSorter} from '../../common/util/util'
import {COMPONENT_LIST, generateNullProps, getTableById, getKeyForId} from '../util/gtfs'
import {getMapToGtfsStrategy, entityIsNew} from '../util/objects'
import {assignDistancesToPatternStops, constructShapePoints} from '../util/map'

const defaultState = {
  active: {},
  lock: {},
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
    case 'RECEIVE_FEEDSOURCE':
      const feedSourceId = action.payload ? action.payload.id : undefined
      return update(state, {active: {$merge: {feedSourceId}}})
    case 'RECEIVE_BASE_GTFS': {
      const feed = clone(action.payload.feed)
      if (feed.feed_info.length === 0) {
        console.warn(`No feed info found. Adding feed info with null values.`)
        feed.feed_info.push(generateNullProps('feedinfo'))
      }
      return update(state, {
        tables: {$set: feed},
        status: {$set: {}}
      })
    }
    case 'SHOW_EDITOR_MODAL':
      return update(state, {status: {showEditorModal: {$set: true}}})
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
      return update(state, {active: {subEntity: {$merge: {
        shapePoints,
        patternStops
      }}}})
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
      return update(state, {active: {$set: active}})
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
    case 'SAVED_GTFS_ENTITY':
      // Simply update save status (this re-enables certain UI actions, e.g.,
      // pattern stops can be dragged/reordered once again). Replacing entities
      // in store is handled on fetch base GTFS entities.
      return update(state, {status: {
        savePending: {$set: false},
        saveSuccessful: {$set: true}
      }})
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
      if (component === 'pattern') {
        // Handle trip patterns to be drawn as overlay layer in editor
        return update(state, {
          tripPatterns: {$set:
            // FIXME: Update for new trip pattern data structure
            data.feed.patterns.map(pattern => {
              return {
                id: pattern.id,
                name: pattern.name,
                route_id: pattern.route_id,
                latLngs: pattern.shape_points
                  ? (pattern.shape_points.map(sp =>
                    ({lon: sp.shape_pt_lon, lat: sp.shape_pt_lat})))
                  : null
              }
            })
          }
        })
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
      const stateUpdate = {
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
    case 'TOGGLE_PATTERN_EDITING': {
      return update(state, {active: {patternSegment: {$set: undefined}}})
    }
    case 'UPDATE_ENTITY_SORT':
      return update(state, {sort: {$merge: action.payload}})
    case 'SET_ACTIVE_PATTERN_STOP':
      return update(state, {active: {patternStop: {$set: action.payload}}})
    case 'SET_ACTIVE_PATTERN_SEGMENT':
      return update(state, {active: {patternSegment: {$set: action.payload}}})
    case 'CREATING_SNAPSHOT':
    case 'LOADING_FEEDVERSION_FOR_EDITING':
      return update(state, {status: {creatingSnapshot: {$set: true}}})
    case 'HANDLING_FINISHED_JOB':
      if (action.payload.type === 'CREATE_SNAPSHOT') {
        return update(state, {status: {
          creatingSnapshot: {$set: false},
          snapshotFinished: {$set: true}
        }})
      } else {
        return state
      }
    case 'SET_EDITOR_CHECK_IN':
      return update(state, {lock: {$merge: action.payload}})
    case 'RECEIVE_TRIP_COUNTS_FOR_PATTERN': {
      const {patternId, tripCounts} = action.payload
      return update(state, {tables: {
        trip_counts: {[`pattern:${patternId}`]: {$set: tripCounts}}}
      })
    }
    case 'RECEIVE_TRIP_COUNTS': {
      const {tripCounts} = action.payload
      return update(state, {tables: {trip_counts: {$set: tripCounts}}})
    }
    default:
      return state
  }
}

export default data
