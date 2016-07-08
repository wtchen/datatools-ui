import { secureFetch } from '../../common/util/util'

//// FEED_INFO

export function requestingFeedInfo (feedId) {
  return {
    type: 'REQUESTING_FEED_INFO',
    feedId
  }
}

export function receiveFeedInfo (feedInfo) {
  return {
    type: 'RECEIVE_FEED_INFO',
    feedInfo
  }
}

export function savingFeedInfo (feedId, feedInfo) {
  return {
    type: 'SAVING_FEED_INFO',
    feedId,
    feedInfo
  }
}

export function fetchFeedInfo (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedInfo(feedId))
    const url = `/api/manager/secure/feedinfo/${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(feedInfo => {
        dispatch(receiveFeedInfo(feedInfo))
      })
  }
}

////// Create new feed info

export function saveFeedInfo (feedId, feedInfo) {
  return function (dispatch, getState) {
    dispatch(savingFeedInfo(feedId, feedInfo))
    const data = {
      // datatools props
      id: feedInfo.id,
      color: feedInfo.color,
      defaultLat: feedInfo.defaultLat,
      defaultLon: feedInfo.defaultLon,
      routeTypeId: feedInfo.routeTypeId,

      // gtfs spec props
      feedEndDate: feedInfo.feed_end_date,
      feedStartDate: feedInfo.feed_start_date,
      feedLang: feedInfo.feed_lang,
      feedPublisherName: feedInfo.feed_publisher_name,
      feedPublisherUrl: feedInfo.feed_publisher_url,
      feedVersion: feedInfo.feed_version,
    }
    const url = `/api/manager/secure/feedinfo/${feedId}`
    return secureFetch(url, getState(), 'put', data)
      .then((res) => {
        return dispatch(fetchFeedInfo(feedId))
      })
  }
}

export function updateFeedInfo (feedInfo, changes) {
  return function (dispatch, getState) {
    dispatch(savingFeedInfo(feedInfo.id))
    const url = `/api/manager/secure/feedinfo/${feedInfo.id}`
    return secureFetch(url, getState(), 'put', changes)
      .then(res => res.json())
      .then(feedInfo => {
        dispatch(receiveFeedInfo(feedInfo))
      })
  }
}
