// @flow

import {secureFetch} from '../../common/actions'
import { compose, feed } from '../../gtfs/util/graphql'

import type {dispatchFn, getStateFn} from '../../types'

function fetchingFeed (feedId, date, from, to) {
  return {
    type: 'FETCH_GRAPHQL_FEED',
    feedId,
    date,
    from,
    to
  }
}

function errorFetchingFeed (feedId, date, from, to) {
  return {
    type: 'FETCH_GRAPHQL_FEED_REJECTED',
    feedId,
    date,
    from,
    to
  }
}

function receiveFeed (feedId, data) {
  return {
    type: 'FETCH_GRAPHQL_FEED_FULFILLED',
    feedId,
    data
  }
}

export function fetchFeed (
  namespace: String,
  date: String,
  from: Number,
  to: Number
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(fetchingFeed(namespace, date, from, to))
    return dispatch(secureFetch(compose(feed, {namespace, date, from, to})))
      .then((response) => {
        if (response.status >= 300) {
          return dispatch(errorFetchingFeed(namespace, date, from, to))
        }
        return response.json()
      })
      .then(json => {
        dispatch(receiveFeed(namespace, json.data))
      })
  }
}
