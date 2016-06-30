import { secureFetch } from '../../common/util/util'

//// STOPS

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
    const data = {
      gtfsStopId: stop.stop_id,
      stopCode: stop.stop_code,
      stopName: stop.stop_name,
      stopDesc: stop.stop_desc,
      lat: stop.stop_lat,
      lon: stop.stop_lon,
      zoneId: stop.zone_id,
      stopUrl: stop.stop_url,
      locationType: stop.location_type,
      parentStation: stop.parent_station,
      stopTimezone: stop.stop_timezone,
      wheelchairBoarding: stop.wheelchair_boarding,
      bikeParking: stop.bikeParking,
      carParking: stop.carParking,
      pickupType: stop.pickupType,
      dropOffType: stop.dropOffType,
      feedId: stop.feedId,
      id: stop.id === 'new' ? null : stop.id,
    }
    const method = stop.id !== 'new' ? 'put' : 'post'
    const url = stop.id !== 'new'
      ? `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
      : `/api/manager/secure/stop?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(stop => {
        // dispatch(receiveStop(feedId, stop))
        dispatch(fetchStops(feedId))
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
    dispatch(deletingStop(feedId, stop))
    if (stop.id === 'new') {
      return dispatch(fetchStops(feedId))
    }
    const url = `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(route => {
        dispatch(fetchStops(feedId))
      })
  }
}
