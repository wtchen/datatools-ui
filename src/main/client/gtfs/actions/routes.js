import fetch from 'isomorphic-fetch'
import { compose, routes } from '../../gtfs/util/graphql'

function fetchingRoutes (feedId) {
  return {
    type: 'FETCH_GRAPHQL_ROUTES',
    feedId
  }
}

function receiveRoutes (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_ROUTES_FULFILLED',
    data
  }
}

export function fetchRoutes (feedId) {
  return function (dispatch, getState) {
    dispatch(fetchingRoutes())
    return fetch(compose(routes, { feedId: feedId }))
      .then((response) => {
        return response.json()
      })
      .then(json => {
        dispatch(receiveRoutes(feedId, json))
      })
  }
}
