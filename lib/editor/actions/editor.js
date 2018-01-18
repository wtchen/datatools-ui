import {createAction} from 'redux-actions'

import {
  generateUID,
  generateRandomInt,
  generateRandomColor,
  idealTextColor
} from '../../common/util/util'
import {fetchGraphQL, secureFetch} from '../../common/actions'
import {saveActiveGtfsEntity, setActiveGtfsEntity} from './active'
import {ENTITY} from '../constants'
import {isValidComponent, findEntityByGtfsId, getTableById} from '../util/gtfs'

export function createGtfsEntity (feedSourceId, component, props) {
  return {
    type: 'CREATE_GTFS_ENTITY',
    feedSourceId,
    component,
    props
  }
}

function getCloneProps (entityId, component, state) {
  const {active, tables} = state.editor.data
  const activeTable = getTableById(tables, component)
  switch (component) {
    case 'trippattern':
      const pattern = active.entity.tripPatterns.find(tp => tp.id === entityId)
      return {
        ...pattern,
        // Overwrite existing name 'X' with 'X copy'
        name: `${pattern.name} copy`
      }
    default:
      return {...activeTable.find(e => e.id === entityId)}
  }
}

export function cloneGtfsEntity (feedSourceId, component, entityId, save) {
  return function (dispatch, getState) {
    if (entityId === ENTITY.NEW_ID) {
      // Prevent cloning new entity
      return null
    }
    const props = {
      id: ENTITY.NEW_ID,
      ...getCloneProps(entityId, component, getState())
    }
    dispatch(newGtfsEntity(feedSourceId, component, props, save))
  }
}

export function newGtfsEntities (feedSourceId, component, propsArray, save) {
  return function (dispatch, getState) {
    Promise.all(propsArray.map(props => {
      return dispatch(newGtfsEntity(feedSourceId, component, props, save))
    })).then(results => {
      return results
    })
  }
}

const generateProps = (component, editorState) => {
  const agencies = getTableById(editorState.data.tables, 'agency', false)
  const agency = agencies ? agencies[0] : null
  const color = generateRandomColor()
  const feedInfo = getTableById(editorState.data.tables, 'feedinfo', false)
  switch (component) {
    case 'route':
      return {
        route_id: generateUID(),
        agency_id: agency ? agency.id : null,
        route_short_name: generateRandomInt(1, 300),
        route_long_name: null,
        route_color: color,
        route_text_color: idealTextColor(color),
        publiclyVisible: false,
        status: 'IN_PROGRESS',
        route_type: feedInfo && feedInfo.defaultRouteType !== null ? feedInfo.defaultRouteType : 3
      }
    case 'stop':
      const stopId = generateUID()
      return {
        stop_id: stopId,
        stop_name: null,
        stop_lat: 0,
        stop_lon: 0
      }
    case 'scheduleexception':
      return {
        dates: []
      }
    case 'trippattern':
      return {
        // patternStops: [],
      }
  }
}

export function newGtfsEntity (feedSourceId, component, props, save) {
  return function (dispatch, getState) {
    if (!props) {
      props = generateProps(component, getState().editor)
    }
    if (save) {
      return dispatch(saveActiveGtfsEntity(component, props))
    } else {
      dispatch(createGtfsEntity(feedSourceId, component, props))
      if (props && 'routeId' in props) {
        // console.log('setting after create')
        dispatch(setActiveGtfsEntity(feedSourceId, 'route', props.routeId, component, ENTITY.NEW_ID))
      } else {
        console.log('setting after create', feedSourceId, component, ENTITY.NEW_ID)
        dispatch(setActiveGtfsEntity(feedSourceId, component, ENTITY.NEW_ID))
      }
    }
  }
}

// GENERIC TABLE ACTIONS

export const receiveGtfsTable = createAction('RECEIVE_GTFSEDITOR_TABLE')

// FIXME: replace with GraphQL fetches
export function getGtfsTable (component, feedId) {
  return function (dispatch, getState) {
    const route = component === 'fare' ? 'fareattribute' : component
    const url = `/api/editor/secure/${route}?feedId=${feedId}`
    return dispatch(secureFetch(url))
      .then(res => res.json())
      .then(entities => dispatch(receiveGtfsTable({component, entities})))
  }
}

export function uploadBrandingAsset (feedId, entityId, component, file) {
  return function (dispatch, getState) {
    if (!file) {
      console.warn('No file to upload!')
      return
    }
    var data = new window.FormData()
    data.append('file', file)
    const url = `/api/editor/secure/${component}/${entityId}/uploadbranding?feedId=${feedId}`
    // Server handles associating branding asset entity's field
    return dispatch(secureFetch(url, 'post', data, false, false))
      .then(res => res.json())
      .then(r => dispatch(getGtfsTable(component, feedId)))
  }
}

const fetchingBaseGtfs = createAction('FETCHING_BASE_GTFS')
const receiveBaseGtfs = createAction('RECEIVE_BASE_GTFS')

// FIXME: add additional params
// TODO: fetch nested elements
export function fetchBaseGtfs ({namespace, component, newId, activeEntityId, feedSourceId, subComponent, subEntityId, subSubComponent, activeSubSubEntity}) {
  return function (dispatch, getState) {
    const query = `
      query ($namespace: String) {
        feed(namespace: $namespace) {
          agency {
            id
            agency_id
            agency_name
          }
          calendar {
            id
            service_id
          }
          fares {
            id
            fare_id
          }
          routes (limit: -1) {
            id
            route_id
            route_short_name
            route_long_name
          }
          stops (limit: -1) {
            id
            stop_id
            stop_code
            stop_name
            stop_lat
            stop_lon
          }
        }
      }
    `
    // TODO: fetch patterns / subcomponent in nested query?
    dispatch(fetchingBaseGtfs({namespace}))
    if (!namespace) {
      console.error('Cannot fetch GTFS for undefined or null namespace')
      return
    }
    return dispatch(fetchGraphQL({query, variables: {namespace}}))
      .then(res => res.json())
      .then(data => dispatch(receiveBaseGtfs({...data})))
      // FIXME? Setting active entity is currently done after fetching base GTFS
      // (in a separate action). Maybe we want to combine that step here.
      // .then(() => {
      //   console.log('setting active after fetch', component, newId)
      //   dispatch(dispatch(setActiveGtfsEntity(feedSourceId, component, newId, subComponent, subEntityId, subSubComponent, activeSubSubEntity)))
      // })
      // .catch(err => console.log(err))
  }
}

export function fetchActiveTable (activeTable, newId, activeEntityId, feedSourceId, subComponent, subEntityId, subSubComponent, activeSubSubEntity) {
  return function (dispatch, getState) {
    if (isValidComponent(activeTable)) {
      const entities = getState().editor
      // dispatch(getGtfsTable(activeTable, feedSourceId))
      // FETCH trip patterns if route selected
      // .then((entities) => {
      if (activeEntityId === ENTITY.NEW_ID) {
        dispatch(newGtfsEntity(feedSourceId, activeTable))
      } else if (activeEntityId && entities.findIndex(e => e.id === activeEntityId) === -1) {
        console.log('could not find ID... trying to map to GTFS ID')
        // Attempt to match against gtfsRouteId / gtfsStopId / gtfsAgencyId / etc.
        newId = findEntityByGtfsId(activeTable, activeEntityId, entities)
        if (newId === -1) {
          console.log('bad entity id, going back to ' + activeTable)
          return dispatch(setActiveGtfsEntity(feedSourceId, activeTable))
        }
      }
      dispatch(setActiveGtfsEntity(feedSourceId, activeTable, newId, subComponent, subEntityId, subSubComponent, activeSubSubEntity))
      // })
    } else {
      // If component being fetched is not valid, set editor to feed source root.
      dispatch(setActiveGtfsEntity(feedSourceId))
    }
  }
}

export const updateEntitySort = createAction('UPDATE_ENTITY_SORT')
