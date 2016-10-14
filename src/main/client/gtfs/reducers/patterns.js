import update from 'react-addons-update'

import { getRouteName } from '../../editor/util/gtfs'

const defaultState = {
  routeFilter: null,
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state = defaultState, action) {
  switch (action.type) {
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
    case 'FETCH_GRAPHQL_PATTERNS_FULFILLED':
      let allRoutes = action.data ? action.data.routes : []
      let allPatterns = []

      for (let i = 0; i < allRoutes.length; i++) {
        const curRouteId = allRoutes[i].route_id
        const curRouteName = getRouteName(allRoutes[i])

        for (let j = 0; j < allRoutes[i].patterns.length; j++) {
          let curPattern = allRoutes[i].patterns[j]
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
    case 'PATTERN_ROUTE_FILTER_CHANGE':
      return update(state, {routeFilter: { $set: action.payload }})
    default:
      return state
  }
}
