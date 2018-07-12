// @flow

import {createAction} from 'redux-actions'

import {fetchGraphQL} from '../../common/actions'
import {updateRouteOffset} from './filter'
import {allRoutes, routeDetails} from '../../gtfs/util/graphql'

import type {dispatchFn, getStateFn} from '../../types'

// routes is for a list of all routes
export const fetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES')
export const clearRoutes = createAction('CLEAR_GRAPHQL_ROUTES')
export const errorFetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES_REJECTED')
const receiveRoutes = createAction('FETCH_GRAPHQL_ROUTES_FULFILLED')

// the route details includes more details about each route in order to display
// the route trip histogram.  Also, to ensure timely responses from the server
// the route details is paginated.  This is the main motivation for having two
// separate entities for dealing with routes
export const fetchingRouteDetails = createAction('FETCH_GRAPHQL_ROUTE_DETAILS')
export const clearRouteDetails = createAction('CLEAR_GRAPHQL_ROUTE_DETAILS')
export const errorFetchingRouteDetails = createAction('FETCH_GRAPHQL_ROUTE_DETAILS_REJECTED')
const receiveRouteDetails = createAction('FETCH_GRAPHQL_ROUTE_DETAILS_FULFILLED')

export function fetchRouteDetails (namespace: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const {
      dateTimeFilter,
      routeLimit,
      routeOffset
    } = getState().gtfs.filter
    dispatch(fetchingRouteDetails(namespace))
    return dispatch(fetchGraphQL({
      query: routeDetails,
      variables: {
        date: dateTimeFilter.date,
        namespace,
        routeLimit,
        routeOffset
      }
    }))
      .then(data => {
        const {
          routes,
          row_counts: {
            routes: numRoutes
          }
        } = data.feed
        dispatch(receiveRouteDetails({numRoutes, routes}))
      })
  }
}

export function fetchRoutes (namespace: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(fetchingRoutes(namespace))
    return dispatch(fetchGraphQL({query: allRoutes, variables: {namespace}}))
      .then(data => dispatch(receiveRoutes(data.feed.routes)))
  }
}

export function routeOffsetChange ({
  namespace,
  offset
}: {
  namespace: string,
  offset: number
}) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(updateRouteOffset(offset))
    dispatch(fetchRouteDetails(namespace))
  }
}
