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


export function savingTrips (feedId, pattern, calendarId, trips) {
  return {
    type: 'SAVING_TRIPS',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

// export function receiveTrips (feedId, trips) {
//   return {
//     type: 'RECEIVE_TRIPS',
//     feedId,
//     trips
//   }
// }

export function saveTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    dispatch(savingTrips(feedId, pattern, calendarId, trips))
    Promise.all(trips.map(trip => {
      const method = trip.id !== 'new' ? 'put' : 'post'
      const url = trip.id !== 'new'
        ? `/api/manager/secure/trip/${trip.id}?feedId=${feedId}`
        : `/api/manager/secure/trip?feedId=${feedId}`
      trip.id = trip.id === 'new' ? null : trip.id
      return secureFetch(url, getState(), method, trip)
        .then(res => res.json())
    }))
    .then(trips => {
      // console.log(trips)
      dispatch(fetchTripsForCalendar(feedId, pattern, calendarId))
      // return trips
    })
    // return result
  }
}

// export function saveTrip (feedId, trip) {
//   // return function (dispatch, getState) {
//     // const url = `/api/manager/secure/trip/?feedId=${feedId}&patternId=${pattern.id}&calendarId=${calendarId}`
//     const url = trip.id !== 'new'
//       ? `/api/manager/secure/trip/${trip.id}?feedId=${feedId}`
//       : `/api/manager/secure/trip?feedId=${feedId}`
//     return secureFetch(url, getState())
//       .then(res => res.json())
//       .then(trips => {
//         return trip
//       })
//   // }
// }

export function deletingTrips (feedId, pattern, calendarId, trips) {
  return {
    type: 'DELETING_TRIPS',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

export function deleteTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    dispatch(deletingTrips(feedId, pattern, calendarId, trips))
    Promise.all(trips.map(trip => {
      const url = `/api/manager/secure/trip/${trip.id}?feedId=${feedId}`
      return secureFetch(url, getState(), 'delete', trip)
        .then(res => res.json())
    }))
    .then(trips => {
      // console.log(trips)
      dispatch(fetchTripsForCalendar(feedId, pattern, calendarId))
      // return trips
    })
    // return result
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
