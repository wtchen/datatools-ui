import fetch from 'isomorphic-fetch'
import {createAction} from 'redux-actions'

import {compose, patterns} from '../../gtfs/util/graphql'
import {updateRouteFilter, updatePatternFilter} from './filter'

export const fetchingPatterns = createAction('FETCH_GRAPHQL_PATTERNS')
export const clearPatterns = createAction('CLEAR_GRAPHQL_PATTERNS')
export const errorFetchingPatterns = createAction('FETCH_GRAPHQL_PATTERNS_REJECTED')
export const receivePatterns = createAction('FETCH_GRAPHQL_PATTERNS_FULFILLED')

export function patternDateTimeFilterChange (namespace, props) {
  return function (dispatch, getState) {
    const routeId = getState().gtfs.filter.routeFilter
    const { date, from, to } = getState().gtfs.filter.dateTimeFilter
    dispatch(fetchPatterns(namespace, routeId, date, from, to))
  }
}

export function fetchPatterns (namespace, routeId, date, from, to) {
  return function (dispatch, getState) {
    dispatch(fetchingPatterns({namespace, routeId, date, from, to}))
    // FIXME: if routeId is null, clear current routes so we can fetch all routes
    if (!routeId) {
      const routes = []
      return dispatch(receivePatterns({namespace, routes}))
    }
    return fetch(compose(patterns, {namespace, routeId, date, from, to}))
      .then((response) => {
        if (response.status >= 300) {
          return dispatch(errorFetchingPatterns(namespace, routeId))
        }
        return response.json()
      })
      .then(json => {
        if (json.data) {
          const {routes} = json.data.feed
          dispatch(receivePatterns({namespace, routes}))
        } else {
          console.log('Error fetching patterns')
        }
      })
  }
}

export function patternRouteFilterChange (namespace, routeData) {
  return function (dispatch, getState) {
    const newRouteId = (routeData && routeData.route_id) ? routeData.route_id : null
    const {date, from, to} = getState().gtfs.filter.dateTimeFilter
    dispatch(updateRouteFilter(newRouteId))
    // If there's an active pattern, clear it
    dispatch(updatePatternFilter(null))
    dispatch(fetchPatterns(namespace, newRouteId, date, from, to))
  }
}
