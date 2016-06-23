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

export function savingFeedInfo (feedId) {
  return {
    type: 'SAVING_FEED_INFO',
    feedId
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

export function saveFeedInfo (props) {
  return function (dispatch, getState) {
    dispatch(savingFeedInfo())
    const url = '/api/manager/secure/feedinfo'
    return secureFetch(url, getState(), 'post', props)
      .then((res) => {
        return dispatch(fetchProjectWithFeeds(props.projectId))
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
