// @flow

import update from 'react-addons-update'

import {getRouteName, mapPatternShape} from '../../editor/util/gtfs'

export type Pattern = {
  geometry: {
    coordinates: Array<Array<number>>,
    type: string,
  },
  name: string,
  route_id: string,
  route_name: string,
  pattern_id: string,
  shape: Array<{
    lat: number,
    lon: number
  }>,
  stops: Array<{
    stop_id: string
  }>,
  trips: Array<{
    stop_times: Array<{
      arrival_time: number,
      departure_time: number
    }>
  }>
}

export type PatternsState = {
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  },
  data: Array<Pattern>
}

export const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state: PatternsState = defaultState, action: any): PatternsState {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
    case 'FETCH_GRAPHQL_PATTERNS':
      return update(state,
        {
          fetchStatus: {
            $set: {
              fetched: false,
              fetching: true,
              error: false
            }
          },
          data: {$set: []}
        }
      )
    case 'FETCH_GRAPHQL_PATTERNS_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          }
        }
      })
    case 'RECEIVED_GTFS_ELEMENTS':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: true,
            fetching: false,
            error: false
          }
        },
        data: {$set: action.patterns.map(mapPatternShape)}
      })
    case 'FETCH_GRAPHQL_PATTERNS_FULFILLED':
      const {routes} = action.payload
      const allPatterns = []

      // iterate over routes from graphql to set route name
      for (let i = 0; i < routes.length; i++) {
        const curRouteId = routes[i].route_id
        const curRouteName = getRouteName(routes[i])
        // iterate over patterns from graphql to add route ref fields
        for (let j = 0; j < routes[i].patterns.length; j++) {
          const curPattern = mapPatternShape(routes[i].patterns[j])
          curPattern.route_id = curRouteId
          curPattern.route_name = curRouteName
          allPatterns.push(curPattern)
        }
      }

      return update(state,
        {
          fetchStatus: {
            $set: {
              fetched: true,
              fetching: false,
              error: false
            }
          },
          data: {$set: allPatterns}
        }
      )
    default:
      return state
  }
}
