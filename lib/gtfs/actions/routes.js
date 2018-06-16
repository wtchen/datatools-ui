// @flow

import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import {compose, routes} from '../../gtfs/util/graphql'

import type {dispatchFn, getStateFn} from '../../types'

export const fetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES')
export const clearRoutes = createAction('CLEAR_GRAPHQL_ROUTES')
export const errorFetchingRoutes = createAction('FETCH_GRAPHQL_ROUTES_REJECTED')
const receiveRoutes = createAction('FETCH_GRAPHQL_ROUTES_FULFILLED')

export function fetchRoutes (namespace: String) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const state = getState()
    const {
      dateTimeFilter: {date, from, to},
      routeLimit,
      routeOffset
    } = state.gtfs.filter
    dispatch(fetchingRoutes(namespace))
    return dispatch(
      secureFetch(
        compose(routes, {
          date,
          from,
          namespace,
          routeLimit,
          routeOffset,
          to
        })
      )
    )
      .then(response => response.json())
      .then(json => {
        const {routes} = json.data.feed
        dispatch(receiveRoutes({namespace, routes}))
      })
  }
}
