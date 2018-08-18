// @flow

import {createAction} from 'redux-actions'

import {fetchGraphQL} from '../../common/actions'
import {patterns} from '../../gtfs/util/graphql'
import {updateRouteFilter, updatePatternFilter} from './filter'

import type {dispatchFn, getStateFn} from '../../types/reducers'

export const fetchingPatterns = createAction('FETCH_GRAPHQL_PATTERNS')
export const clearPatterns = createAction('CLEAR_GRAPHQL_PATTERNS')
export const errorFetchingPatterns = createAction(
  'FETCH_GRAPHQL_PATTERNS_REJECTED'
)
export const receivePatterns = createAction('FETCH_GRAPHQL_PATTERNS_FULFILLED')

export function patternDateTimeFilterChange (namespace: string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const {routeFilter: routeId} = getState().gtfs.filter
    dispatch(fetchPatterns(namespace, routeId))
  }
}

export function fetchPatterns (namespace: string, routeId: ?string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(fetchingPatterns())
    if (!routeId) {
      const routes = []
      return dispatch(receivePatterns({routes}))
    }
    const {date} = getState().gtfs.filter.dateTimeFilter
    return dispatch(
      fetchGraphQL({query: patterns, variables: {namespace, routeId, date}})
    )
      .then(data => {
        if (data) {
          const {routes} = data.feed
          dispatch(receivePatterns({routes}))
        } else {
          console.error('Error fetching patterns')
        }
      })
  }
}

export function patternRouteFilterChange (namespace: string, newRouteId: ?string) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(updateRouteFilter(newRouteId))
    // If there's an active pattern, clear it
    dispatch(updatePatternFilter(null))
    dispatch(fetchPatterns(namespace, newRouteId))
  }
}
