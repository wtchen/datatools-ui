import update from 'react-addons-update'

import { getRouteName } from '../../editor/util/gtfs'

const defaultState = {
  routeFilter: null,
  patternFilter: null,
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case 'FETCH_GRAPHQL_STOPS':
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
    case 'FETCH_GRAPHQL_STOPS_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          },
          data: {$set: []}
        }
      })
    case 'FETCH_GRAPHQL_STOPS_FULFILLED':
      let allRoutes = action.data.routes || []
      let allPatterns = []
      let allStops = action.data.stops || []

      for (let i = 0; i < allRoutes.length; i++) {
        let route = allRoutes[i]
        const curRouteId = route.route_id
        const curRouteName = getRouteName(route)

        for (let j = 0; j < route.patterns.length; j++) {
          let pattern = allRoutes[i].patterns[j]
          pattern.route_id = curRouteId
          pattern.route_name = curRouteName
          allPatterns.push(pattern)
          for (let k = 0; k < pattern.stops.length; k++) {
            let stop = pattern.stops[k]
            allStops.push(stop)
          }
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
          data: {$set: allStops}
        }
      )
    case 'STOP_ROUTE_FILTER_CHANGE':
      return update(state, {routeFilter: { $set: action.payload }})
    case 'STOP_PATTERN_FILTER_CHANGE':
      return update(state, {patternFilter: { $set: action.payload }})
    default:
      return state
  }

}
