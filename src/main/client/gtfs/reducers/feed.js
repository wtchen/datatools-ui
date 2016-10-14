import update from 'react-addons-update'


const defaultState = {
  fetchStatus: {
    fetched: false,
    fetching: false,
    error: false
  },
  data: []
}

const feedStatKeyDescription = {
  feed_id: 'Feed Id',
  feed_publisher_name: 'Publisher',
  feed_publisher_url: 'Publisher URL',
  feed_lang: 'Language Code',
  feed_version: 'Feed Version',
  route_count: 'Number of Routes in Feed',
  stop_count: "Number of Stops in Feed"
}

export default function reducer(state=defaultState, action) {

  switch (action.type) {
    case 'FETCH_GRAPHQL_FEED_PENDING':
      return {
        fetchStatus: {
          fetched: false,
          fetching: true,
          error: false
        },
        data: []
      }
      break
    case 'FETCH_GRAPHQL_FEED_REJECTED':
      return update(state, {
        fetchStatus: {
          $set: {
            fetched: false,
            fetching: false,
            error: true
          }
        },
        data: []
      })
      break
    case 'FETCH_GRAPHQL_FEED_FULFILLED':
      let feedData = action.data.feeds[0],
        feedStats = []
      const feedKeys = Object.keys(feedData)
      for (let i = 0; i < feedKeys.length; i++) {
        feedStats.push({
          statName: feedStatKeyDescription[feedKeys[i]],
          statValue: feedData[feedKeys[i]]
        })
      }
      return {
        fetchStatus: {
          fetched: true,
          fetching: false,
          error: false
        },
        data: feedStats
      }
      break
    default:
      return state
  }

}
