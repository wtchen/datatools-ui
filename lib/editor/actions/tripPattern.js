import {createAction} from 'redux-actions'
import {snakeCaseKeys} from '../../common/util/map-keys'

import {secureFetch} from '../../common/actions'
import {generateUID} from '../../common/util/util'
import {fetchGTFSEntities} from '../../manager/actions/versions'
import {resetActiveGtfsEntity, savedGtfsEntity, updateActiveGtfsEntity, updateEditSetting} from './active'
import {fetchTripCounts} from './trip'
import {getEditorNamespace} from '../util/gtfs'
import {resequenceStops, resequenceShapePoints} from '../util/map'
import {entityIsNew} from '../util/objects'

const undoTripPatternEdits = createAction('UNDO_TRIP_PATTERN_EDITS')
export const setActiveStop = createAction('SET_ACTIVE_PATTERN_STOP')
export const togglingPatternEditing = createAction('TOGGLE_PATTERN_EDITING')
export const setActivePatternSegment = createAction('SET_ACTIVE_PATTERN_SEGMENT')
export const resnapStops = createAction('RESNAP_STOPS')
const savedTripPattern = createAction('SAVED_TRIP_PATTERN')

/**
 * Convenience action to update active pattern's pattern stops. Handles proper
 * resequencing of pattern stops to ensure they are zero-based, incrementing
 * values.
 */
export function updatePatternStops (pattern, patternStops) {
  return function (dispatch, getState) {
    const sortedPatternStops = patternStops.map(resequenceStops)
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops: sortedPatternStops}))
  }
}

export function undoActiveTripPatternEdits () {
  return function (dispatch, getState) {
    // Get most recent set of control points and pattern segments.
    const {past} = getState().editor.editSettings
    const {controlPoints, patternSegments} = past[past.length - 1]
    // Action signals to the redux-undo library to reset to the past state. The
    // control points and pattern segments are ONLY used by the data reducer to
    // reset the active trip pattern shape points.
    dispatch(undoTripPatternEdits({controlPoints, patternSegments}))
  }
}

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
    const {id: routeId} = getState().editor.data.active.entity
    // Resequence shape points to ready shape_points for insertion into shapes
    // table. NOTE: if the pattern shape has been edited, the sequence should
    // already be correct. However, if it is unedited, it may not be zero-based,
    // so we prevent that here.
    // NOTE: This must be applied before snake case-ing (because
    // resequenceShapePoints updates the camelCase field shapePtSequence).
    tripPattern.patternStops = tripPattern.patternStops.map(resequenceStops)
    if (!tripPattern.shapeId) {
      // If trip pattern has no shape ID (e.g., if the pattern was imported
      // without shapes), generate one and assign shape points to the new ID.
      const shapeId = generateUID()
      tripPattern.shapeId = shapeId
      tripPattern.shapePoints = tripPattern.shapePoints.map(sp => ({...sp, shapeId}))
    }
    tripPattern.shapePoints = tripPattern.shapePoints.map(resequenceShapePoints)
    const data = snakeCaseKeys(tripPattern)
    // Shape points must be assigned to shapes field in order to match back end
    // model and apply updates.
    data.shapes = data.shape_points
    // Remove large fields that are unrecognized by the back end.
    delete data.shape_points
    delete data.shape
    const url = patternIsNew
      ? `/api/editor/secure/pattern?feedId=${feedId}&sessionId=${sessionId}`
      : `/api/editor/secure/pattern/${tripPattern.id}?feedId=${feedId}&sessionId=${sessionId}`
    data.id = patternIsNew ? null : tripPattern.id
    return dispatch(secureFetch(url, method, data))
      .then(res => res.json())
      .then(newTripPattern => {
        dispatch(savedGtfsEntity(newTripPattern))
        // Signals to undo history that pattern history should be cleared.
        dispatch(savedTripPattern(newTripPattern))
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
