// @flow

import update from 'react-addons-update'

export type StopsState = {
  fetchStatus: {
    fetched: boolean,
    fetching: boolean,
    error: boolean
  },
  data: Array<any>
}

export const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

export default function reducer (state: StopsState = defaultState, action: any) {
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return defaultState
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
    case 'RECEIVED_GTFS_ELEMENTS':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: true,
            fetching: false,
            error: false
          }
        },
        data: {$set: action.stops}
      })
    case 'FETCH_GRAPHQL_STOPS_FULFILLED':
      const {patternId, routeId, data} = action.payload
      let stops
      if (patternId) {
        stops = data.feed.patterns[0].stops
      } else if (routeId) {
        stops = data.feed.routes[0].stops
      } else {
        stops = []
      }
      // FIXME: when stops fetched for pattern, an error is not caught
      const hasError = false
      // // If no feed is returned, there was an uncaught error during fetch.
      // if (!data || !data.feed) {
      //   data.feed = {routes: [], stops: []}
      //   hasError = true
      // }
      // const allRoutes = feed.routes || []
      // const allPatterns = []
      // const allStops = feed.stops || []

      // for (let i = 0; i < allRoutes.length; i++) {
      //   const route = allRoutes[i]
      //   const curRouteId = route.route_id
      //   const curRouteName = getRouteName(route)
      //
      //   for (let j = 0; j < route.patterns.length; j++) {
      //     const pattern = allRoutes[i].patterns[j]
      //     pattern.route_id = curRouteId
      //     pattern.route_name = curRouteName
      //     allPatterns.push(pattern)
      //     for (let k = 0; k < pattern.stops.length; k++) {
      //       const stop = pattern.stops[k]
      //       allStops.push(stop)
      //     }
      //   }
      // }

      return update(state,
        {
          fetchStatus: {
            $set: {
              fetched: true,
              fetching: false,
              error: hasError
            }
          },
          data: {$set: stops}
        }
      )
    default:
      return state
  }
}
