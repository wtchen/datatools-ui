import {createAction} from 'redux-actions'
import snakeCaseKeys from 'snakecase-keys'

import {secureFetch} from '../../common/actions'
import {setActiveGtfsEntity, updateEditSetting} from './active'
import {entityIsNew, tripPatternToGtfs} from '../util/objects'

// TRIP PATTERNS

const requestingTripPatterns = createAction('REQUESTING_TRIP_PATTERNS')
const receiveTripPatterns = createAction('RECEIVE_TRIP_PATTERNS')
export const undoActiveTripPatternEdits = createAction('UNDO_TRIP_PATTERN_EDITS')
export const setActiveStop = createAction('SET_ACTIVE_PATTERN_STOP')
export const togglingPatternEditing = createAction('TOGGLE_PATTERN_EDITING')
export const setActivePatternSegment = createAction('SET_ACTIVE_PATTERN_SEGMENT')
const savedTripPattern = createAction('SAVED_TRIP_PATTERN')
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
    const routeId = tripPattern.routeId
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
      .then(tripPattern => {
        dispatch(savedTripPattern({feedId, tripPattern: tripPatternToGtfs(tripPattern)}))
        if (patternIsNew) {
          dispatch(setActiveGtfsEntity(feedId, 'route', routeId, 'trippattern', tripPattern.id))
        }
        // dispatch(fetchTripPatternsForRoute(feedId, routeId))
        // const tp = tripPattern
        return tripPattern
      })
  }
}
