// @flow

import type {GtfsStop} from '../../types'

export type StopsState = {
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  },
  data: Array<GtfsStop>
}

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

export default function reducer (state: StopsState = defaultState, action: any): StopsState {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_STOPS':
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
        data: action.payload.stops
      }
    default:
      return state
  }
}
