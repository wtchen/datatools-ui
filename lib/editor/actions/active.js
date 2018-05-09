import clone from 'lodash.clonedeep'
import {browserHistory} from 'react-router'
import {createAction} from 'redux-actions'

import {ENTITY} from '../constants'
import {fetchGTFSEntities} from '../../manager/actions/versions'
import {secureFetch} from '../../common/actions'
import {saveTripPattern} from './tripPattern'
import {newGtfsEntity, fetchBaseGtfs} from './editor'
import {isValidComponent, getEditorNamespace, getTableById, subComponentList, subSubComponentList} from '../util/gtfs'
import {getMapFromGtfsStrategy, entityIsNew} from '../util/objects'

export function updateEditSetting (setting, value) {
  return {
    type: 'UPDATE_EDIT_SETTING',
    setting,
    value
  }
}

export function updateActiveGtfsEntity (entity, component, props) {
  return {
    type: 'UPDATE_ACTIVE_GTFS_ENTITY',
    entity,
    component,
    props
  }
}

export function resetActiveGtfsEntity (entity, component) {
  return {
    type: 'RESET_ACTIVE_GTFS_ENTITY',
    entity,
    component
  }
}

export const clearGtfsContent = createAction('CLEAR_GTFSEDITOR_CONTENT')
export const savedGtfsEntity = createAction('SAVED_GTFS_ENTITY')
export const deletingEntity = createAction('DELETING_ENTITY')
const settingActiveGtfsEntity = createAction('SETTING_ACTIVE_GTFS_ENTITY')
const receivedNewEntity = createAction('RECEIVE_NEW_ENTITY')
export const savingActiveGtfsEntity = createAction('SAVING_ACTIVE_GTFS_ENTITY')

export function enterTimetableEditor () {
  return function (dispatch, getState) {
    const {active, tables} = getState().editor.data
    const routes = getTableById(tables, 'route')
    dispatch(setActiveGtfsEntity(active.feedSourceId, 'route', routes[0].id, 'trippattern', ENTITY.NEW_ID, 'timetable'))
  }
}

/**
 * Wrapper function for setActiveGtfsEntity that takes entity objects and sets
 * the ID values.
 */
export function setActiveEntity (feedSourceId, component, entity, subComponent, subEntity, subSubComponent, subSubEntity) {
  return function (dispatch, getState) {
    const entityId = entity && entity.id
    const subEntityId = subEntity && subEntity.id
    // This should only ever be a calendar entity
    const subSubEntityId = subSubEntity && subSubEntity.service_id
    dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
  }
}

/**
 * This function is used to set the active components in the GTFS editor.
 * It also handles clearing GTFS content should the feed being edited change.
 * It ALSO handles redirecting the browser URL if an entity referenced by a route
 * parameter is not found in the list of entities.
 *
 * FIXME: There is too much going on in this action.
 */
export function setActiveGtfsEntity (
  feedSourceId,
  component,
  entityId,
  subComponent,
  subEntityId,
  subSubComponent,
  subSubEntityId
) {
  return function (dispatch, getState) {
    // TODO: Figure out a good way to handle route changes without confirm window
    // when there are unsaved changes to the active entity (or subentity).
    // if (getState().editor.data.active.edited && !window.confirm('You have unsaved changes. Discard changes?')) {
    //   return false
    // }
    const {data, feedSourceId: prevFeedSourceId, editSettings} = getState().editor
    const {sessionId} = data.lock
    if (!sessionId) {
      console.warn('No session lock for feed source. Aborting set active entity')
      return
    }
    const prevEntityId = data.active.entityId
    const namespace = getEditorNamespace(feedSourceId, getState())
    const activeTable = component && getTableById(data.tables, component)
    if (prevFeedSourceId && feedSourceId !== prevFeedSourceId) {
      // Feed source has changed. Clear GTFS content
      // FIXME: Do we need to clear GTFS content if namespace changes?
      // FIXME: This should be covered by GtfsEditor#componentWillReceiveProps
      console.warn(`Feed source ID has changed ${prevFeedSourceId} to ${feedSourceId}. Clearing GTFS content.`)
      dispatch(clearGtfsContent())
    }
    if (editSettings.present.editGeometry) {
      // Stop editing geometry if currently editing
      dispatch(updateEditSetting('editGeometry', false))
    }
    if (
      entityId === ENTITY.NEW_ID &&
      (!activeTable || activeTable.findIndex(e => e.id === ENTITY.NEW_ID) === -1)
    ) {
      // Create new GTFS entity if id is ENTITY.NEW_ID and no ENTITY.NEW_ID
      // entity exists in table
      dispatch(newGtfsEntity(feedSourceId, component))
    }
    const url = constructEditorURL(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId)
    const {locationBeforeTransitions} = getState().routing
    const pathname = locationBeforeTransitions && locationBeforeTransitions.pathname
    if (!locationBeforeTransitions || !pathname || pathname !== url) {
      // console.log('updating url', url, pathname)
      browserHistory.push(url)
    }
    const activeEntity = component === 'feedinfo'
      ? clone(activeTable)[0]
      : activeTable && entityId
        ? clone(activeTable.find(e => e.id === entityId))
        : null
    const activeSubEntity = activeEntity && activeEntity.tripPatterns
      ? clone(activeEntity.tripPatterns.find(p => p.id === subEntityId))
      : null
    // Update value for follow streets when setting active route
    // FIXME: Ensure this update is working properly
    if (entityId && component === 'route') {
      const followStreets = activeEntity
        // If route type is bus or tram, set to true. If other, set false.
        ? (activeEntity.route_type === 3 || activeEntity.route_type === 0 || typeof activeEntity.route_type === 'undefined')
        // Default for no route type is true (most routes are buses/follow streets)
        : true
      dispatch(updateEditSetting('followStreets', followStreets))
      // console.log('setting follow streets', activeEntity, followStreets)
    }
    // TODO: Fetch active entity and any subentities.
    // Only fetch entity if it is not being created
    if (namespace && entityId && component && entityId !== ENTITY.NEW_ID) {
      if (!activeSubEntity && !(component === 'route' && prevEntityId === entityId)) {
        // Only fetch trip patterns if the active pattern is not in the store and
        // if we're changing routes
        dispatch(fetchGTFSEntities({namespace, id: entityId, type: component, editor: true}))
      }
    }
    dispatch(settingActiveGtfsEntity({
      activeEntity,
      activeSubEntity,
      component,
      entityId,
      feedSourceId,
      subComponent,
      subEntityId,
      subSubComponent,
      subSubEntityId
    }))
  }
}

function constructEditorURL (feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId) {
  const pathItems = ['feed', feedSourceId, 'edit', component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId]
    // Filter out any null or undefined items
    .filter(item => item)
  let url = '/' + pathItems.join('/')
  if (component && !isValidComponent(component)) {
    // If component is not valid, go to editor root.
    console.warn(`"${component}" is not a valid URL component path`)
    url = `/feed/${feedSourceId}/edit/`
  } else if (subComponent && subComponentList.indexOf(subComponent) === -1) {
    // If subComponent is not valid, go to active entity
    console.warn(`"${subComponent}" is not a valid URL subComponent path`)
    url = `/feed/${feedSourceId}/edit/${component}/${entityId}/`
  } else if (subSubComponent && subSubComponentList.indexOf(subSubComponent) === -1) {
    // If subSubComponent is not valid, go to sub entity
    console.warn(`"${subSubComponent}" is not a valid URL subSubComponent path`)
    url = `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/`
  }
  return url
}

export function saveActiveGtfsEntity (component, optionalEntity, refetch = true) {
  return function (dispatch, getState) {
    const {active} = getState().editor.data
    let entity = optionalEntity || active.entity
    const feedId = entity.feedId || active.feedSourceId
    let saveStrategy
    switch (component) {
      // FIXME
      case 'trippattern':
        // let route = active.entity
        // let patternId = active.subEntityId
        entity = optionalEntity || active.subEntity // route.tripPatterns.find(p => p.id === patternId)
        saveStrategy = saveTripPattern
        break
      default:
        // Default method for agencies, stops, routes, fares, calendars.
        // Trip patterns and feed info are handled above. Trips are handled in
        // timetable actions.
        saveStrategy = saveEntity
    }
    // Execute save function
    dispatch(savingActiveGtfsEntity({component, entity}))
    return dispatch(saveStrategy(feedId, entity, component, refetch))
  }
}

/**
 * Generic method for saving an entity using REST endpoint. The only entity
 * types with unique save methods are trip patterns and trips (handled in timetable
 * actions).
 *
 * This method determines the URL from entity type (component), maps the entity
 * data into the required format (primarily updates fields to snake_case), and
 * after performing PUT request re-fetches the entity.
 */
export function saveEntity (feedId, entity, component, refetch = true) {
  return function (dispatch, getState) {
    const notNew = !entityIsNew(entity)
    const method = notNew ? 'put' : 'post'
    const idParam = notNew ? `/${entity.id}` : ''
    const {sessionId} = getState().editor.data.lock
    const route = component === 'fare' ? 'fareattribute' : component
    const url = `/api/editor/secure/${route}${idParam}?feedId=${feedId}&sessionId=${sessionId}`
    const mappingStrategy = getMapFromGtfsStrategy(component)
    const data = mappingStrategy(entity)
    return dispatch(secureFetch(url, method, data))
      .then(res => res.json())
      .then(savedEntity => {
        dispatch(savedGtfsEntity(savedEntity))
        const namespace = getEditorNamespace(feedId, getState())
        // Refetch entity and replace in store
        if (refetch) {
          return dispatch(fetchGTFSEntities({
            namespace,
            id: savedEntity.id,
            type: component,
            editor: true,
            replaceNew: !notNew
          }))
        } else {
          // Push new entity into store.
          dispatch(receivedNewEntity({component, entity: savedEntity}))
          return Promise.resolve(savedEntity)
        }
      })
  }
}

/**
 * Generic delete function for editor GTFS entities.
 */
export function deleteGtfsEntity (feedId, component, entityId, routeId) {
  return function (dispatch, getState) {
    const namespace = getEditorNamespace(feedId, getState())
    dispatch(deletingEntity({namespace, feedId, component, entityId, routeId}))
    if (entityId === ENTITY.NEW_ID) {
      // Entity is new/unsaved. Overwrite current table with existing entities.
      // FIXME: we should just remove the ENTITY.NEW_ID entity from the store. This is a
      // waste of network traffic (especially for large feeds)
      return dispatch(fetchBaseGtfs({namespace, component}))
    }
    const {sessionId} = getState().editor.data.lock
    const entityPath = component === 'trippattern'
      ? 'pattern'
      : component === 'fare' ? 'fareattribute' : component
    const url = `/api/editor/secure/${entityPath}/${entityId}?feedId=${feedId}&sessionId=${sessionId}`
    return dispatch(secureFetch(url, 'delete'))
      .then(response => response.json())
      .then(json => {
        if (component === 'trippattern' && routeId) {
          console.log('fetching trip patterns')
          // Replace trip patterns for route
          return dispatch(fetchGTFSEntities({namespace, id: routeId, type: 'route', editor: true}))
        } else {
          console.log('fetching base gtfs')
          // Replace entire table
          return dispatch(fetchBaseGtfs({namespace, component}))
        }
      })
  }
}
