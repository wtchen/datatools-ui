import fetch from 'isomorphic-fetch'

import { compose, patterns } from '../../gtfs/util/graphql'

export function fetchingPatterns (feedId, routeId) {
  return {
    type: 'FETCH_GRAPHQL_PATTERNS',
    feedId,
    routeId
  }
}

export function clearPatterns () {
  return {
    type: 'CLEAR_GRAPHQL_PATTERNS'
  }
}

export function errorFetchingPatterns (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_PATTERNS_REJECTED',
    data
  }
}

export function receivePatterns (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_PATTERNS_FULFILLED',
    data
  }
}

export function patternDateTimeFilterChange (feedId, props) {
  return function (dispatch, getState) {
    const routeId = getState().gtfs.patterns.routeFilter
    const { date, from, to } = getState().gtfs.filter.dateTimeFilter
    dispatch(fetchPatterns(feedId, routeId, date, from, to))
  }
}

export function fetchPatterns (feedId, routeId, date, from, to) {
  return function (dispatch, getState) {
    dispatch(fetchingPatterns(feedId, routeId, date, from, to))
    if (!routeId) {
      return dispatch(receivePatterns(feedId, {routes: []}))
    }
    return fetch(compose(patterns, {feedId, routeId, date, from, to}))
      .then((response) => {
        if (response.status >= 300) {
          return dispatch(errorFetchingPatterns(feedId, routeId))
        }
        return response.json()
      })
      .then(json => {
        dispatch(receivePatterns(feedId, json))
      })
  }
}

export function updateRouteFilter (routeId) {
  return {
    type: 'PATTERN_ROUTE_FILTER_CHANGE',
    payload: routeId
  }
}

export function patternRouteFilterChange (feedId, routeData) {
  return function (dispatch, getState) {
    const newRouteId = (routeData && routeData.route_id) ? routeData.route_id : null
    const {date, from, to} = getState().gtfs.filter.dateTimeFilter
    dispatch(updateRouteFilter(newRouteId))
    dispatch(fetchPatterns(feedId, newRouteId, date, from, to))
  }
}
