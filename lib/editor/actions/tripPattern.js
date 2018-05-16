import {createAction} from 'redux-actions'
import snakeCaseKeys from 'snakecase-keys'

import {secureFetch} from '../../common/actions'
import {fetchGTFSEntities} from '../../manager/actions/versions'
import {resetActiveGtfsEntity, savedGtfsEntity, updateEditSetting} from './active'
import {fetchTripCounts} from './trip'
import {entityIsNew} from '../util/objects'
import {getEditorNamespace} from '../util/gtfs'

export const undoActiveTripPatternEdits = createAction('UNDO_TRIP_PATTERN_EDITS')
export const setActiveStop = createAction('SET_ACTIVE_PATTERN_STOP')
export const togglingPatternEditing = createAction('TOGGLE_PATTERN_EDITING')
export const setActivePatternSegment = createAction('SET_ACTIVE_PATTERN_SEGMENT')
export const resnapStops = createAction('RESNAP_STOPS')

export function togglePatternEditing () {
  return function (dispatch, getState) {
    const {editGeometry} = getState().editor.editSettings.present
    dispatch(updateEditSetting('editGeometry', !editGeometry))
    dispatch(togglingPatternEditing())
  }
}

/**
 * Fetch all trip patterns for the feed. Used to display pattern shapes in map
 * layer.
 */
export function fetchTripPatterns (feedId) {
  return function (dispatch, getState) {
    const namespace = getEditorNamespace(feedId, getState())
    return dispatch(fetchGTFSEntities({namespace, type: 'pattern', editor: true}))
  }
}

export function saveTripPattern (feedId, tripPattern) {
  return function (dispatch, getState) {
    const patternIsNew = entityIsNew(tripPattern)
    const {sessionId} = getState().editor.data.lock
    const method = patternIsNew ? 'post' : 'put'
    // Route ID needed for re-fetch is the ID field of the active entity (route)
    // NOTE: The pattern being saved is the active **sub**-entity.
    const routeId = getState().editor.data.active.entity.id
    const data = snakeCaseKeys(tripPattern)
    // Convert control points and pattern segments into shape points
    // FIXME: ready shape_points for insertion into shapes table
    data.shapes = data.shape_points
    delete data.shape_points
    const url = patternIsNew
      ? `/api/editor/secure/pattern?feedId=${feedId}&sessionId=${sessionId}`
      : `/api/editor/secure/pattern/${tripPattern.id}?feedId=${feedId}&sessionId=${sessionId}`
    data.id = patternIsNew ? null : tripPattern.id
    return dispatch(secureFetch(url, method, data))
      .then(res => res.json())
      .then(newTripPattern => {
        dispatch(savedGtfsEntity(newTripPattern))
        const namespace = getEditorNamespace(feedId, getState())
        // // Refetch entity and replace in store
        return dispatch(fetchGTFSEntities({
          namespace,
          id: routeId,
          type: 'route',
          editor: true,
          replaceNew: patternIsNew,
          patternId: newTripPattern.id
        }))
      })
      .catch(err => {
        console.log(err)
        dispatch(resetActiveGtfsEntity(tripPattern, 'trippattern'))
      })
  }
}

/**
 * Deletes all trips for a given pattern ID. This is used to clear the trips for
 * a pattern if/when a pattern is changed from frequency-based to timetable-baed.
 */
export function deleteAllTripsForPattern (feedId, patternId) {
  return function (dispatch, getState) {
    const {sessionId} = getState().editor.data.lock
    const url = `/api/editor/secure/pattern/${patternId}/trips?feedId=${feedId}&sessionId=${sessionId}`
    return dispatch(secureFetch(url, 'delete'))
      .then(res => res.json())
      .then(json => json && json.result === 'OK')
      .then(() => dispatch(fetchTripCounts(feedId)))
  }
}
