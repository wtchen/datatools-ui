import update from 'react-addons-update'
import objectPath from 'object-path'
import clone from 'lodash.clonedeep'

import { sortAndFilterTrips } from '../util'
import { isTimeFormat } from '../util/timetable'

const defaultState = {
  status: {
    fetched: false,
    error: false,
    fetching: false
  },
  columns: [],
  trips: [],
  edited: [],
  selected: [],
  hideDepartureTimes: false,
  offset: null
}

const timetable = (state = defaultState, action) => {
  let trips
  switch (action.type) {
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      return defaultState
    case 'REQUESTING_TRIPS_FOR_CALENDAR':
      return update(state, {
        status: {$set: {
          fetched: false,
          error: false,
          fetching: true
        }}
      })
    case 'RECEIVE_TRIPS_FOR_CALENDAR':
      trips = clone(sortAndFilterTrips(action.payload.trips, action.payload.pattern.use_frequency))
      return update(state, {
        trips: {$set: trips},
        status: {
          fetched: {$set: true},
          fetching: {$set: false}
        },
        edited: {$set: []}
      })
    case 'OFFSET_ROWS':
      trips = clone(state.trips)
      const editedRows = []
      // console.log(`Offsetting ${action.payload.rowIndexes.length} rows by ${action.payload.offset} seconds`)
      for (var i = 0; i < action.payload.rowIndexes.length; i++) {
        editedRows.push(action.payload.rowIndexes[i])
        for (var j = 0; j < state.columns.length; j++) {
          const col = state.columns[j]
          const path = `${action.payload.rowIndexes[i]}.${col.key}`
          if (isTimeFormat(col.type)) {
            const currentVal = objectPath.get(trips, path)
            const value = currentVal + (action.payload.offset % 86399) // ensure seconds does not exceed 24 hours
            objectPath.set(trips, path, value)
          }
        }
      }
      return update(state, {
        trips: {$set: trips},
        edited: {$push: editedRows}
      })
    case 'SET_TIMETABLE_OFFSET':
      return update(state, {
        offset: {$set: action.payload.seconds}
      })
    case 'UPDATE_TIMETABLE_CELL_VALUE':
      trips = clone(state.trips)
      objectPath.set(trips, action.payload.key, action.payload.value)
      return update(state, {
        trips: {$set: trips},
        edited: {$push: [action.payload.rowIndex]}
      })
    case 'TOGGLE_ALL_TIMETABLE_ROW_SELECTION':
      const selected = []
      if (action.payload.active) {
        for (let i = 0; i < state.trips.length; i++) {
          selected.push(i)
        }
      }
      return update(state, {
        selected: {$set: selected}
      })
    case 'TOGGLE_DEPARTURE_TIMES':
      return update(state, {
        hideDepartureTimes: {$set: !state.hideDepartureTimes}
      })
    case 'ADD_NEW_TRIP':
      return update(state, {
        trips: {$push: [action.payload]},
        edited: {$push: [state.trips.length]}
      })
    case 'REMOVE_TRIPS':
      return update(state, {
        trips: {$splice: action.payload}
      })
    case 'TOGGLE_SINGLE_TIMETABLE_ROW_SELECTION':
      const selectIndex = state.selected.indexOf(action.payload.rowIndex)
      if (selectIndex === -1) {
        return update(state, {
          selected: {$push: [action.payload.rowIndex]}
        })
      } else {
        return update(state, {
          selected: {$splice: [[selectIndex, 1]]}
        })
      }
    default:
      return state
  }
}

export default timetable
