import { secureFetch } from '../../common/util/util'
import { setErrorMessage } from '../../manager/actions/status'

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
    let errorCount = 0
    const errorIndexes = []
    dispatch(savingTrips(feedId, pattern, calendarId, trips))
    return Promise.all(trips.filter(t => t).map((trip, index) => {
      const tripExists = trip.id !== 'new' && trip.id !== null
      const method = tripExists ? 'put' : 'post'
      const url = tripExists
        ? `/api/manager/secure/trip/${trip.id}?feedId=${feedId}`
        : `/api/manager/secure/trip?feedId=${feedId}`
      trip.id = tripExists ? trip.id : null
      return secureFetch(url, getState(), method, trip)
        .then(res => {
          if (res.status >= 300) {
            errorCount++
            errorIndexes.push(index)
            return null
          } else {
            return res.json()
          }
        })
    }))
    .then(trips => {
      // console.log(trips)
      if (errorCount) {
        dispatch(setErrorMessage(`Unknown error encountered while saving trips.  Could not save ${errorCount} trips`))
      }
      dispatch(fetchTripsForCalendar(feedId, pattern, calendarId))
      return errorIndexes
    })
    // return result
  }
}

// TODO: action is under construction...
export function saveMultipleTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    let errorCount = 0
    const errorIndexes = []
    dispatch(savingTrips(feedId, pattern, calendarId, trips))
    const newTrips = []
    const existingTrips = []
    trips.forEach(t => {
      const tripExists = t.id !== 'new' && t.id !== null
      if (tripExists) {
        existingTrips.push(t)
      } else {
        newTrips.push(t)
      }
    })
    const createUrl = `/api/manager/secure/trip?feedId=${feedId}`
    return secureFetch(createUrl, getState(), 'post')
      .then(res => {
        if (res.status >= 300) {
          errorCount++
          // errorIndexes.push(index)
          return null
        } else {
          return res.json()
        }
      })
    .then(trips => {
      // console.log(trips)
      if (errorCount) {
        dispatch(setErrorMessage(`Unknown error encountered while saving trips.  Could not save ${errorCount} trips`))
      }
      dispatch(fetchTripsForCalendar(feedId, pattern, calendarId))
      return errorIndexes
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
    type: 'DELETING_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

export function deletedTrips (feedId, pattern, calendarId, trips) {
  return {
    type: 'DELETED_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

export function deleteTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    let errorCount = 0
    dispatch(deletingTrips(feedId, pattern, calendarId, trips))
    return Promise.all(trips.map(trip => {
      const url = `/api/manager/secure/trip/${trip.id}?feedId=${feedId}`
      return secureFetch(url, getState(), 'delete', trip)
        .then(res => res.json())
        .catch(error => {
          console.log(error)
          errorCount++
        })
    }))
    .then(trips => {
      // console.log(trips)
      if (errorCount) {
        dispatch(setErrorMessage(`Unknown error encountered while deleting trips.  Could not delete ${errorCount} trips`))
      }
      dispatch(fetchTripsForCalendar(feedId, pattern, calendarId))
      // dispatch(deletedTrips(feedId, pattern, calendarId, trips))
      // return trips
    })
    // return result
  }
}

export function updateCellValue (value, rowIndex, key) {
  return {
    type: 'UPDATE_TIMETABLE_CELL_VALUE',
    value,
    rowIndex,
    key
  }
}

export function toggleRowSelection (rowIndex) {
  return {
    type: 'TOGGLE_SINGLE_TIMETABLE_ROW_SELECTION',
    rowIndex
  }
}
export function toggleAllRows (select) {
  return {
    type: 'TOGGLE_ALL_TIMETABLE_ROW_SELECTION',
    select
  }
}
export function toggleDepartureTimes () {
  return {
    type: 'TOGGLE_DEPARTURE_TIMES'
  }
}
export function setOffset (seconds) {
  return {
    type: 'SET_TIMETABLE_OFFSET',
    seconds
  }
}
export function addNewTrip (trip) {
  return {
    type: 'ADD_NEW_TRIP',
    trip
  }
}

export function removeTrips (indexes) {
  return {
    type: 'REMOVE_TRIPS',
    indexes
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
