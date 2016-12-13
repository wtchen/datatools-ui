import { secureFetch } from '../../common/util/util'
import { setErrorMessage } from '../../manager/actions/status'
import { setActiveGtfsEntity } from './active'
import { getStopsForPattern, getTimetableColumns } from '../util'

// TRIP PATTERNS

export function requestingTripPatterns (feedId) {
  return {
    type: 'REQUESTING_TRIP_PATTERNS',
    feedId
  }
}

export function receiveTripPatterns (feedId, tripPatterns) {
  return {
    type: 'RECEIVE_TRIP_PATTERNS',
    feedId,
    tripPatterns
  }
}

export function receiveTripPattern (feedId, tripPattern) {
  return {
    type: 'RECEIVE_TRIP_PATTERNS',
    feedId,
    tripPattern
  }
}

export function fetchTripPatterns (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingTripPatternsForRoute(feedId))
    const url = `/api/manager/secure/trippattern?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 400) return []
        return res.json()
      })
      .then(tripPatterns => {
        dispatch(receiveTripPatterns(feedId, tripPatterns))
        return tripPatterns
      })
  }
}

export function fetchTripPattern (feedId, tripPatternId) {
  return function (dispatch, getState) {
    dispatch(requestingTripPatternsForRoute(feedId))
    const url = `/api/manager/secure/trippattern/${tripPatternId}?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 300) return null
        return res.json()
      })
      .then(tp => {
        dispatch(receiveTripPattern(feedId, tp))
        return tp
      })
  }
}

export function undoActiveTripPatternEdits () {
  return {
    type: 'UNDO_TRIP_PATTERN_EDITS'
  }
}

// TODO: merge the following with the above?

export function requestingTripPatternsForRoute (feedId, routeId) {
  return {
    type: 'REQUESTING_TRIP_PATTERNS_FOR_ROUTE',
    feedId,
    routeId
  }
}

export function receiveTripPatternsForRoute (feedId, routeId, tripPatterns, activePattern, activeColumns) {
  return {
    type: 'RECEIVE_TRIP_PATTERNS_FOR_ROUTE',
    feedId,
    routeId,
    tripPatterns,
    activePattern,
    activeColumns
  }
}

export function fetchTripPatternsForRoute (feedId, routeId) {
  return function (dispatch, getState) {
    if (routeId === 'new') {
      return []
    }
    dispatch(requestingTripPatternsForRoute(feedId))
    const url = `/api/manager/secure/trippattern?feedId=${feedId}&routeId=${routeId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 400) {
          // dispatch(setErrorMessage('Error getting stops for trip pattern'))
          return []
        }
        return res.json()
      })
      .then(tripPatterns => {
        const activePattern = getState().editor.data.active.subEntityId && tripPatterns.find(p => p.id === getState().editor.data.active.subEntityId)
        const activePatternStops = getStopsForPattern(activePattern, getState().editor.data.tables.stop)
        const activeColumns = getTimetableColumns(activePattern, activePatternStops)
        dispatch(receiveTripPatternsForRoute(feedId, routeId, tripPatterns, activePattern, activeColumns))
        return tripPatterns
      })
  }
}

export function deletingTripPattern (feedId, tripPattern) {
  return {
    type: 'DELETING_TRIP_PATTERN',
    feedId,
    tripPattern
  }
}

export function deleteTripPattern (feedId, tripPattern) {
  return function (dispatch, getState) {
    dispatch(deletingTripPattern(feedId, tripPattern))
    const routeId = tripPattern.routeId
    if (tripPattern.id === 'new') {
      return dispatch(fetchTripPatternsForRoute(feedId, routeId))
    }
    const url = `/api/manager/secure/trippattern/${tripPattern.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(tripPattern => {
        dispatch(fetchTripPatternsForRoute(feedId, routeId))
      })
  }
}

export function savedTripPattern (feedId, tripPattern) {
  return {
    type: 'SAVED_TRIP_PATTERN',
    feedId,
    tripPattern
  }
}

export function saveTripPattern (feedId, tripPattern) {
  return function (dispatch, getState) {
    const method = tripPattern.id !== 'new' ? 'put' : 'post'
    const routeId = tripPattern.routeId
    let data = {...tripPattern}
    const url = tripPattern.id !== 'new'
      ? `/api/manager/secure/trippattern/${tripPattern.id}?feedId=${feedId}`
      : `/api/manager/secure/trippattern?feedId=${feedId}`
    data.id = tripPattern.id === 'new' ? null : tripPattern.id
    return secureFetch(url, getState(), method, data)
      .then(res => {
        if (res.status >= 300) {
          dispatch(setErrorMessage('Error saving trip pattern'))
          return dispatch(fetchTripPatternsForRoute(feedId, routeId))
        }
        return res.json()
      })
      .then(tp => {
        dispatch(savedTripPattern(feedId, tp))
        if (tripPattern.id === 'new') {
          dispatch(setActiveGtfsEntity(feedId, 'route', routeId, 'trippattern', tp.id))
        }
        return tp
      })
  }
}
