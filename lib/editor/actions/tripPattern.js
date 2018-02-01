import {createAction} from 'redux-actions'
import snakeCaseKeys from 'snakecase-keys'

import {secureFetch} from '../../common/actions'
import {fetchGTFSEntities} from '../../manager/actions/versions'
import {updateEditSetting} from './active'
import {entityIsNew} from '../util/objects'
import {getEditorNamespace} from '../util/gtfs'

// TRIP PATTERNS

const requestingTripPatterns = createAction('REQUESTING_TRIP_PATTERNS')
const receiveTripPatterns = createAction('RECEIVE_TRIP_PATTERNS')
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

export function fetchTripPatterns (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingTripPatterns(feedId))
    const url = `/api/editor/secure/pattern?feedId=${feedId}`
    return dispatch(secureFetch(url))
      .then(res => {
        if (res.status >= 400) return []
        return res.json()
      })
      .then(tripPatterns => {
        dispatch(receiveTripPatterns({feedId, tripPatterns}))
        return tripPatterns
      })
  }
}

export function saveTripPattern (feedId, tripPattern) {
  return function (dispatch, getState) {
    const patternIsNew = entityIsNew(tripPattern)
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
      ? `/api/editor/secure/pattern?feedId=${feedId}`
      : `/api/editor/secure/pattern/${tripPattern.id}?feedId=${feedId}`
    data.id = patternIsNew ? null : tripPattern.id
    return dispatch(secureFetch(url, method, data))
      .then(res => res.json())
      .then(newTripPattern => {
        const namespace = getEditorNamespace(feedId, getState())
        // // Refetch entity and replace in store
        console.log(`setting active pattern to ${newTripPattern.id}`)
        return dispatch(fetchGTFSEntities({
          namespace,
          id: routeId,
          type: 'route',
          editor: true,
          replaceNew: patternIsNew,
          patternId: newTripPattern.id
        }))
      })
  }
}
