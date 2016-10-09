// import axios from 'axios'

import { compose, feed } from '../../gtfs/util/graphql'

export function fetchFeed (feedId) {
  return {
    type: 'FETCH_GRAPHQL_FEED',
    // payload: axios.get(compose(feed, { feedId: feedId }))
  }
}
