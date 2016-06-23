import { secureFetch } from '../../common/util/util'

//// CALENDAR + SCHEDULE_EXCEPTION

export function savingScheduleException (feedId, scheduleException) {
  return {
    type: 'SAVING_SCHEDULE_EXCEPTION',
    feedId,
    scheduleException
  }
}

export function receiveScheduleException (feedId, scheduleException) {
  return {
    type: 'RECEIVE_SCHEDULE_EXCEPTION',
    feedId,
    scheduleException
  }
}

export function saveScheduleException (feedId, scheduleException) {
  return function (dispatch, getState) {
    dispatch(savingScheduleException(feedId, scheduleException))
    const data = {
      gtfsScheduleExceptionId: scheduleException.scheduleException_id,
      scheduleExceptionCode: scheduleException.scheduleException_code,
      scheduleExceptionName: scheduleException.scheduleException_name,
      scheduleExceptionDesc: scheduleException.scheduleException_desc,
      lat: scheduleException.scheduleException_lat,
      lon: scheduleException.scheduleException_lon,
      zoneId: scheduleException.zone_id,
      scheduleExceptionUrl: scheduleException.scheduleException_url,
      locationType: scheduleException.location_type,
      parentStation: scheduleException.parent_station,
      scheduleExceptionTimezone: scheduleException.scheduleException_timezone,
      wheelchairBoarding: scheduleException.wheelchair_boarding,
      bikeParking: scheduleException.bikeParking,
      carParking: scheduleException.carParking,
      pickupType: scheduleException.pickupType,
      dropOffType: scheduleException.dropOffType,
      feedId: scheduleException.feedId,
    }
    const method = scheduleException.id !== 'new' ? 'put' : 'post'
    const url = scheduleException.id !== 'new'
      ? `/api/manager/secure/scheduleexception/${scheduleException.id}?feedId=${feedId}`
      : `/api/manager/secure/scheduleexception?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(scheduleException => {
        // dispatch(receiveScheduleException(feedId, scheduleException))
        dispatch(fetchScheduleExceptions(feedId))
      })
  }
}

export function requestingScheduleExceptions (feedId) {
  return {
    type: 'REQUESTING_SCHEDULE_EXCEPTIONS',
    feedId
  }
}

export function receiveScheduleExceptions (feedId, scheduleExceptions) {
  return {
    type: 'RECEIVE_SCHEDULE_EXCEPTIONS',
    feedId,
    scheduleExceptions
  }
}

export function fetchScheduleExceptions (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingScheduleExceptions(feedId))
    const url = `/api/manager/secure/scheduleexception?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(scheduleExceptions => {
        dispatch(receiveScheduleExceptions(feedId, scheduleExceptions))
        return scheduleExceptions
      })
  }
}

export function deletingScheduleException (feedId, scheduleException) {
  return {
    type: 'DELETING_SCHEDULE_EXCEPTION',
    feedId,
    scheduleException
  }
}

export function deleteScheduleException (feedId, scheduleException) {
  return function (dispatch, getState) {
    dispatch(deletingScheduleException(feedId, scheduleException))
    if (scheduleException.id === 'new') {
      return dispatch(fetchScheduleExceptions(feedId))
    }
    const url = `/api/manager/secure/scheduleexception/${scheduleException.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(route => {
        dispatch(fetchScheduleExceptions(feedId))
      })
  }
}
