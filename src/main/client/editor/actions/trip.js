import { secureFetch } from '../../common/util/util'

//// TRIP

export function requestingTripsForCalendar (feedId, pattern, calendarId) {
  return {
    type: 'REQUESTING_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId
  }
}

export function receiveTripsForCalendar (feedId, pattern, calendarId, trips) {
  return {
    type: 'RECEIVE_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

export function fetchTripsForCalendar (feedId, pattern, calendarId) {
  return function (dispatch, getState) {
    dispatch(requestingTripsForCalendar(feedId, pattern, calendarId))
    const url = `/api/manager/secure/trip?feedId=${feedId}&patternId=${pattern.id}&calendarId=${calendarId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(trips => {
        dispatch(receiveTripsForCalendar(feedId, pattern, calendarId, trips))
      })
  }
}

// export function fetchTripsForCalendar (feedId, patternId, calendarId) {
//   return function (dispatch, getState) {
//     dispatch(requestingTripsForCalendar(feedId, patternId, calendarId))
//     const url = `/api/manager/secure/trip?feedId=${feedId}&patternId=${patternId}&calendarId=${calendarId}`
//     return secureFetch(url, getState())
//       .then(res => res.json())
//       .then(trips => {
//         dispatch(receiveTripsForCalendar(feedId, patternId, calendarId, trips))
//       })
//   }
// }
