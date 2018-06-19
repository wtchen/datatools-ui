// @flow

import update from 'react-addons-update'

import {getRouteName, mapPatternShape} from '../../editor/util/gtfs'

export type PatternsState = {
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  },
  data: Array<any>
}

const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state: PatternsState = defaultState, action: any) {
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
