import fetch from 'isomorphic-fetch'
import { compose, routes } from '../../gtfs/util/graphql'

export function fetchingRoutes (feedId) {
  return {
    type: 'FETCH_GRAPHQL_ROUTES',
    feedId
  }
}

export function clearRoutes () {
  return {
    type: 'CLEAR_GRAPHQL_ROUTES',
  }
}

export function errorFetchingRoutes (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_ROUTES_REJECTED',
    data
  }
}

export function receiveRoutes (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_ROUTES_FULFILLED',
    data
  }
}

export function fetchRoutes (feedId) {
  return function (dispatch, getState) {
    dispatch(fetchingRoutes(feedId))
    return fetch(compose(routes, { feedId: feedId }))
      .then((response) => {
        return response.json()
      })
      .then(json => {
        dispatch(receiveRoutes(feedId, json))
      })
  }
}
