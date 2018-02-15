import {browserHistory} from 'react-router'
import moment from 'moment'
import {createAction} from 'redux-actions'

import {fetchGraphQL, secureFetch} from '../../common/actions'
import {generateUID} from '../../common/util/util'
import {saveActiveGtfsEntity, setActiveGtfsEntity} from './active'
import {ENTITY} from '../constants'
import {
  generateNullProps,
  generateProps,
  getEditorNamespace,
  getTableById
} from '../util/gtfs'
import {fetchGTFSEntities} from '../../manager/actions/versions'

export const updateEntitySort = createAction('UPDATE_ENTITY_SORT')

function createGtfsEntity (feedSourceId, component, props) {
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
      const newPatternId = generateUID()
      const newShapeId = generateUID()
      return {
        ...pattern,
        // Overwrite existing name 'X' with 'X copy'
        name: `${pattern.name} copy`,
        // Overwrite pattern and shape IDs and the IDs of referencing tables.
        patternId: newPatternId,
        shapeId: newShapeId,
        shapePoints: pattern.shapePoints.map(sp => ({...sp, shapeId: newShapeId})),
        patternStops: pattern.patternStops.map(ps => ({...ps, patternId: newPatternId}))
      }
    default:
      return {...activeTable.find(e => e.id === entityId)}
  }
}

export function cloneGtfsEntity (feedSourceId, component, entityId, save) {
  return function (dispatch, getState) {
    if (entityId === ENTITY.NEW_ID) {
      // Prevent cloning new entity
      console.warn('Cannot clone entity that has not been saved yet.')
      return null
    }
    const props = {
      ...getCloneProps(entityId, component, getState()),
      // Add ID field after clone props to ensure it overwrites any previous
      // value.
      id: ENTITY.NEW_ID
    }
    dispatch(newGtfsEntity(feedSourceId, component, props, save))
  }
}

export function lockEditorFeedSource (feedId) {
  return function (dispatch, getState) {
    const {feedId: previousFeedId, sessionId, timestamp} = getState().editor.data.lock
    if (sessionId && previousFeedId === feedId) {
      const duration = moment.duration(moment(timestamp).diff(moment()))
      const minutes = duration.asMinutes()
      if (minutes < 60) {
        console.log(`Session ID ${sessionId} found in session storage. Attempting to resume editor sesssion`)
        // There is already an unexpired session open for this browser tab.
        // FIXME: Handle removing session for different feed source.
        dispatch(startEditorLockMaintenance(sessionId, feedId))
        return Promise.resolve(true)
      }
    }
    const url = `/api/editor/secure/lock?feedId=${feedId}`
    return dispatch(secureFetch(url, 'post', undefined, undefined, undefined, 'RE_LOCK'))
      .then(res => res.json())
      .then(json => {
        console.log(json)
        if (json) {
          dispatch(startEditorLockMaintenance(json.sessionId, feedId))
          return true
        } else return false
      })
      // FIXME: catch error and boot user out of editor?
      .catch(err => {
        // dispatch(setEditorCheckIn({feedId: null, sessionId: null, timer: null, timestamp: null}))
        // browserHistory.push(`/feed/${feedId}/edit`)
        console.warn('Could not create lock on feed source', err)
        return false
      })
  }
}

const setEditorCheckIn = createAction('SET_EDITOR_CHECK_IN')

/**
 * Stop job time function stored with timer ID stored in state.
 */
function stopCurrentTimer (state) {
  // FIXME
  const {timer} = state.editor.data.lock
  if (timer) clearInterval(timer)
}

/**
 * HTTP call to .
 */
function maintainEditorLock (sessionId, feedId) {
  return function (dispatch, getState) {
    const url = `/api/editor/secure/lock/${sessionId}?feedId=${feedId}`
    if (!document.hidden) {
      // Only maintain lock if browser tab is active
      return dispatch(secureFetch(url, 'put', undefined, undefined, undefined, 'RE_LOCK'))
        // .then(response => response.json())
        .then(json => {
          if (json.code >= 400) dispatch(removeEditorLock(feedId))
          else dispatch(setEditorCheckIn({timestamp: moment().format()}))
        })
        .catch(err => {
          console.warn(err)
          dispatch(removeEditorLock(feedId))
        })
    }
  }
}

/**
 * Start editor lock maintenance. This checks in with the server to indicate that
 * the feed should still be checked out for this user's session. Upon success,
 * the session timestamp is updated.
 */
function startEditorLockMaintenance (sessionId, feedId) {
  return function (dispatch, getState) {
    stopCurrentTimer(getState())

    const timerFunction = () => dispatch(maintainEditorLock(sessionId, feedId))
    // make an initial call right now
    timerFunction()
    // Set time to check in every 10 seconds
    const timer = setInterval(timerFunction, 10000)
    // FIXME: Timer needs updating every maintain editor lock call.
    dispatch(setEditorCheckIn({timer, sessionId, feedId, timestamp: moment().format()}))
  }
}

/**
 * Remove current editor lock on feed. This should be called when the GTFS Editor
 * unmounts or the browser tab closes.
 */
export function removeEditorLock (feedId, overwrite = false) {
  return function (dispatch, getState) {
    if (!feedId) {
      feedId = getState().editor.data.active.feedSourceId
    }
    const {sessionId} = getState().editor.data.lock
    // window.sessionStorage.removeItem('feedId')
    // window.sessionStorage.removeItem('sessionId')
    // window.sessionStorage.removeItem('timer')
    // window.sessionStorage.removeItem('timestamp')
    const url = `/api/editor/secure/lock/${sessionId}?feedId=${feedId}${overwrite ? '&overwrite=true' : ''}`
    return dispatch(secureFetch(url, 'delete'))
      // .then(res => res.json())
      .then(res => {
        stopCurrentTimer(getState())
        dispatch(setEditorCheckIn({timer: null, sessionId: null, feedId: null}))
        return res.json()
      })
      .then(json => {
        if (overwrite) {
          if (json.sessionId) {
            dispatch(startEditorLockMaintenance(json.sessionId, feedId))
            return true
          } else {
            return false
          }
        }
      })
  }
}

export function newGtfsEntities (feedSourceId, component, propsArray, save) {
  return function (dispatch, getState) {
    Promise.all(propsArray.map(props => dispatch(newGtfsEntity(feedSourceId, component, props, save))))
  }
}

export function newGtfsEntity (feedSourceId, component, props, save) {
  return function (dispatch, getState) {
    if (!props) {
      props = generateProps(component, getState().editor)
    }
    props = {
      // Add nulled out fields to component (backend expects full set of fields)
      ...generateNullProps(component),
      ...props
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
      .then(r => {
        const namespace = getEditorNamespace(feedId, getState())
        // Refetch entity and replace in store
        dispatch(fetchGTFSEntities({namespace, id: entityId, type: component, editor: true}))
      })
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
          feed_info {
            id
            feed_publisher_name
            feed_publisher_url
            feed_lang
            feed_start_date
            feed_end_date
            feed_version
          }
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
          schedule_exceptions (limit: -1) {
            id
            name
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
    return dispatch(lockEditorFeedSource(feedSourceId))
      .then(lockSuccess => {
        if (!lockSuccess) {
          console.warn('No lock on editor. Canceling feed fetch')
          dispatch(setEditorCheckIn({feedId: null, sessionId: null, timer: null, timestamp: null}))
          browserHistory.push(`/feed/${feedSourceId}/edit`)
          return
        }
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
      })
  }
}
