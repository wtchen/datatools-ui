import {createAction} from 'redux-actions'
import {snakeCaseKeys} from '../../common/util/map-keys'
import {fetchGraphQL, secureFetch} from '../../common/actions'
import {setErrorMessage} from '../../manager/actions/status'
import {entityIsNew} from '../util/objects'
import {getEditorNamespace} from '../util/gtfs'

// Internal fetch/logging/status actions
const deletingTrips = createAction('DELETING_TRIPS_FOR_CALENDAR')
const requestingTripsForCalendar = createAction('REQUESTING_TRIPS_FOR_CALENDAR')
const receiveTripsForCalendar = createAction('RECEIVE_TRIPS_FOR_CALENDAR')
const savingTrips = createAction('SAVING_TRIPS')
const receiveTripCountsForPattern = createAction('RECEIVE_TRIP_COUNTS_FOR_PATTERN')
const receiveTripCounts = createAction('RECEIVE_TRIP_COUNTS')

// Actions used in UI
export const offsetRows = createAction('OFFSET_ROWS')
// TODO: Update UI actions to use createAction
export const updateCellValue = createAction('UPDATE_TIMETABLE_CELL_VALUE')
export const toggleRowSelection = createAction('TOGGLE_SINGLE_TIMETABLE_ROW_SELECTION')
export const toggleAllRows = createAction('TOGGLE_ALL_TIMETABLE_ROW_SELECTION')
export const toggleDepartureTimes = createAction('TOGGLE_DEPARTURE_TIMES')
export const setOffset = createAction('SET_TIMETABLE_OFFSET')
// TODO: replace with post function
export const addNewTrip = createAction('ADD_NEW_TRIP')
export const removeTrips = createAction('REMOVE_TRIPS')

// REST actions
export function fetchTripsForCalendar (feedId, pattern, calendarId, fetchCounts = false) {
  return function (dispatch, getState) {
    const namespace = getEditorNamespace(feedId, getState())
    // This fetches patterns on the pattern_id field (rather than ID) because
    // pattern_id is needed to join on the nested trips table
    const query = `query ($namespace: String, $pattern_id: [String], $service_id: [String]) {
    feed(namespace: $namespace) {
        patterns (pattern_id: $pattern_id) {
          id: pattern_id
          trips (service_id: $service_id, limit: -1) {
            id
            frequencies {
              startTime: start_time
              endTime: end_time
              headwaySecs: headway_secs
              exactTimes: exact_times
            }
            tripId: trip_id
            tripHeadsign: trip_headsign
            tripShortName: trip_short_name
            blockId: block_id
            directionId: direction_id
            route_id
            shape_id
            wheelchair_accessible
            bikes_allowed
            pattern_id
            service_id
            stopTimes: stop_times (limit: -1) {
              stopId: stop_id
              stopSequence: stop_sequence
              arrivalTime: arrival_time
              departureTime: departure_time
              stopHeadsign: stop_headsign
              shape_dist_traveled: shape_dist_traveled
              pickup_type
              drop_off_type
              timepoint
            }
          }
        }
      }
    }`
    dispatch(requestingTripsForCalendar({feedId, pattern, calendarId, query}))
    // FIXME: string casting pattern id
    return dispatch(fetchGraphQL({
      query,
      variables: {namespace, pattern_id: pattern.patternId, service_id: calendarId},
      errorMessage: 'Could not fetch trips for pattern'
    }))
      .then(data => dispatch(receiveTripsForCalendar({trips: data.feed.patterns[0].trips, pattern})))
      .then(() => {
        fetchCounts && dispatch(fetchCalendarTripCountsForPattern(feedId, pattern.patternId))
      })
  }
}

export function saveTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    let errorCount = 0
    const errorIndexes = []
    const {sessionId} = getState().editor.data.lock
    trips = trips.map(snakeCaseKeys)
    dispatch(savingTrips({feedId, pattern, calendarId, trips}))
    return Promise.all(trips.filter(t => t).map((trip, index) => {
      const tripExists = !entityIsNew(trip) && trip.id !== null
      const method = tripExists ? 'put' : 'post'
      const url = tripExists
        ? `/api/editor/secure/trip/${trip.id}?feedId=${feedId}&sessionId=${sessionId}`
        : `/api/editor/secure/trip?feedId=${feedId}&sessionId=${sessionId}`
      // trip.id = tripExists ? trip.id : null
      return dispatch(secureFetch(url, method, trip))
        .then(res => {
          if (!res) {
            errorCount++
            errorIndexes.push(index)
            return null
          } else {
            return res.json()
          }
        })
    }))
      .then(trips => {
        if (errorCount) {
          dispatch(setErrorMessage({message: `Unknown error encountered while saving trips.  Could not save ${errorCount} trips`}))
        }
        dispatch(fetchTripsForCalendar(feedId, pattern, calendarId, true))
        return errorIndexes
      })
  }
}

// TODO: finish function to replace soft (unsaved) addNewTrip for POST API call
export function saveNewTrip (feedId, pattern, calendarId, trip) {
  return function (dispatch, getState) {
    dispatch(savingTrips(feedId, pattern, calendarId, trip))
    const {sessionId} = getState().editor.data.lock
    const url = `/api/editor/secure/trip?feedId=${feedId}&sessionId=${sessionId}`
    trip.id = null
    return dispatch(secureFetch(url, 'post', trip))
      .then(res => res.json())
      .then(t => dispatch(addNewTrip(t)))
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
      const tripExists = entityIsNew(t) && t.id !== null
      if (tripExists) {
        existingTrips.push(t)
      } else {
        newTrips.push(t)
      }
    })
    const {sessionId} = getState().editor.data.lock
    const createUrl = `/api/editor/secure/trip?feedId=${feedId}&sessionId=${sessionId}`
    return dispatch(secureFetch(createUrl, 'post'))
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
          dispatch(setErrorMessage({message: `Unknown error encountered while saving trips.  Could not save ${errorCount} trips`}))
        }
        dispatch(fetchTripsForCalendar(feedId, pattern, calendarId, true))
        return errorIndexes
      })
    // return result
  }
}

/**
 * Delete multiple trips. This method takes the provided trips and maps the trips'
 * IDs to a comma-separated query parameter, indicating which trips to delete.
 */
export function deleteTripsForCalendar (feedId, pattern, calendarId, trips) {
  return function (dispatch, getState) {
    let errorCount = 0
    const {sessionId} = getState().editor.data.lock
    dispatch(deletingTrips({feedId, pattern, calendarId, trips}))
    const url = `/api/editor/secure/trip?feedId=${feedId}&sessionId=${sessionId}&tripIds=${trips.map(t => t.id).join(',')}`
    return dispatch(secureFetch(url, 'delete'))
      .then(res => res.json())
      .catch(error => {
        console.log(error)
        errorCount++
      })
      .then(trips => {
        // console.log(trips)
        if (errorCount) {
          dispatch(setErrorMessage({message: `Unknown error encountered while deleting trips.  Could not delete ${errorCount} trips`}))
        }
        dispatch(fetchTripsForCalendar(feedId, pattern, calendarId, true))
      })
  }
}

/**
 * Fetch trip counts per calendar filtered by a specific pattern ID.
 */
export function fetchCalendarTripCountsForPattern (feedId, patternId) {
  return function (dispatch, getState) {
    const namespace = getEditorNamespace(feedId, getState())
    // This fetches patterns on the pattern_id field (rather than ID) because
    // pattern_id is needed to join on the nested trips table
    const query = `query ($namespace: String, $pattern_id: String) {
      feed(namespace: $namespace) {
        trip_counts {
          service_id (pattern_id: $pattern_id) {
            type
            count
          }
        }
      }
    }`
    return dispatch(fetchGraphQL({
      query,
      variables: {namespace, pattern_id: patternId},
      errorMessage: 'Could not fetch trip counts for pattern'
    }))
      .then(data => dispatch(receiveTripCountsForPattern({tripCounts: data.feed.trip_counts, patternId})))
  }
}

/**
 * Fetch all trip count categories (for each pattern, calendar, and route).
 */
export function fetchTripCounts (feedId) {
  return function (dispatch, getState) {
    const namespace = getEditorNamespace(feedId, getState())
    // This fetches patterns on the pattern_id field (rather than ID) because
    // pattern_id is needed to join on the nested trips table
    const query = `query ($namespace: String) {
      feed(namespace: $namespace) {
        trip_counts {
          service_id {
            type
            count
          }
          pattern_id {
            type
            count
          }
          route_id {
            type
            count
          }
        }
      }
    }`
    return dispatch(fetchGraphQL({
      query,
      variables: {namespace},
      errorMessage: 'Could not fetch trip counts.'
    }))
      .then(data => dispatch(receiveTripCounts({tripCounts: data.feed.trip_counts})))
  }
}
