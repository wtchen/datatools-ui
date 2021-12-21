// @flow

import type {Action} from '../../types/actions'
import type {LocationsState} from '../../types/reducers'

export const defaultState = {
  routeFilter: null,
  patternFilter: null,
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (
  state: LocationsState = defaultState,
  action: Action
): LocationsState {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_LOCATIONS':
      return {
        ...state,
        fetchStatus: {
          fetched: false,
          fetching: true,
          error: false
        },
        data: []
      }
    case 'FETCH_GRAPHQL_STOPS_REJECTED':
      return {
        ...state,
        fetchStatus: {
          fetched: false,
          fetching: false,
          error: true
        },
        data: []
      }
    case 'RECEIVED_GTFS_ELEMENTS':
      return {
        ...state,
        fetchStatus: {
          fetched: true,
          fetching: false,
          error: false
        },
        data: action.payload.locations
      }
    default:
      return state
  }
}
