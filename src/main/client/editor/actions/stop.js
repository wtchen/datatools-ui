import { secureFetch } from '../../common/util/util'
import { setActiveGtfsEntity } from './active'
import { isNew, stopFromGtfs } from '../util/gtfs'

// STOPS

export function savingStop (feedId, stop) {
  return {
    type: 'SAVING_STOP',
    feedId,
    stop
  }
}

export function receiveStop (feedId, stop) {
  return {
    type: 'RECEIVE_STOP',
    feedId,
    stop
  }
}

export function saveStop (feedId, stop) {
  return function (dispatch, getState) {
    dispatch(savingStop(feedId, stop))
    const method = !isNew(stop) ? 'put' : 'post'
    const url = !isNew(stop)
      ? `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
      : `/api/manager/secure/stop?feedId=${feedId}`
    const data = stopFromGtfs(stop)
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(newStop => {
        dispatch(receiveStop(feedId, newStop))
        // only set active if stop.id === 'new', if id is undefined, do not set active entity
        if (stop.id === 'new') {
          dispatch(deletingStop(feedId, stop))
          dispatch(setActiveGtfsEntity(feedId, 'stop', newStop.id))
        }
        return newStop
      })
  }
}

export function requestingStops (feedId) {
  return {
    type: 'REQUESTING_STOPS',
    feedId
  }
}

export function receiveStops (feedId, stops) {
  return {
    type: 'RECEIVE_STOPS',
    feedId,
    stops
  }
}

export function fetchStops (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingStops(feedId))
    const url = `/api/manager/secure/stop?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(stops => {
        dispatch(receiveStops(feedId, stops))
        return stops
      })
  }
}

export function fetchStopsForTripPattern (feedId, tripPatternId) {
  return function (dispatch, getState) {
    if (tripPatternId === 'new' || tripPatternId === null) {
      return []
    }
    dispatch(requestingStops(feedId))
    const url = `/api/manager/secure/stop?feedId=${feedId}&patternId=${tripPatternId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 400) {
          // dispatch(setErrorMessage('Error getting stops for trip pattern'))
          return null
        }
        return res.json()
      })
      .then(stops => {
        dispatch(receiveStops(feedId, stops))
        return stops
      })
  }
}

export function deletingStop (feedId, stop) {
  return {
    type: 'DELETING_STOP',
    feedId,
    stop
  }
}

export function deleteStop (feedId, stop) {
  return function (dispatch, getState) {
    console.log(stop)
    dispatch(deletingStop(feedId, stop))
    if (stop.id === 'new') {
      return // dispatch(removeStop(feedId, stop))
    }
    const url = `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(route => {
        dispatch(fetchStops(feedId))
      })
  }
}
