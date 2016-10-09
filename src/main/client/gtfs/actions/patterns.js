import fetch from 'isomorphic-fetch'

import { compose, patterns } from '../../gtfs/util/graphql'

function fetchingPatterns (feedId, routeId) {
  return {
    type: 'FETCH_GRAPHQL_PATTERNS',
    feedId,
    routeId
  }
}

function receivePatterns (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_PATTERNS_FULFILLED',
    data
  }
}


export function fetchPatterns (feedId, routeId) {
  return function (dispatch, getState) {
    dispatch(fetchingPatterns(feedId, routeId))
    return fetch(compose(patterns, {feedId, routeId}))
      .then((response) => {
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
  return function (dispatch) {
    const newRouteId = (routeData && routeData.route_id) ? routeData.route_id : null
    dispatch(updateRouteFilter(newRouteId))
    dispatch(fetchPatterns(feedId, newRouteId))
  }
}
