import { secureFetch } from '../util/util'

import { fetchProject } from './projects'

// Feed Source Actions

export function requestingFeedSources() {
  return {
    type: 'REQUESTING_FEEDSOURCES'
  }
}

export function receiveFeedSources(projectId, feedSources) {
  return {
    type: 'RECEIVE_FEEDSOURCES',
    projectId,
    feedSources
  }
}

export function fetchProjectFeeds(projectId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSources())
    const url = '/api/manager/secure/feedsource?projectId=' + projectId
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(feedSources => {
        dispatch(receiveFeedSources(projectId, feedSources))
      })
  }
}

export function createFeedSource(projectId) {
  return {
    type: 'CREATE_FEEDSOURCE',
    projectId
  }
}


export function savingFeedSource() {
  return {
    type: 'SAVING_FEEDSOURCE'
  }
}

export function saveFeedSource(props) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource())
    const url = '/api/manager/secure/feedsource'
    return secureFetch(url, getState(), 'post', props)
      .then((res) => {
        return dispatch(fetchProject(props.projectId))
      })
  }
}

export function updateFeedSource(feedSource, changes) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource())
    const url = '/api/manager/secure/feedsource/' + feedSource.id
    return secureFetch(url, getState(), 'put', changes)
      .then((res) => {
        return dispatch(fetchProjectFeeds(feedSource.projectId))
      })
  }
}

export function deletingFeedSource() {
  return {
    type: 'DELETING_FEEDSOURCE'
  }
}

export function deleteFeedSource(feedSource, changes) {
  return function (dispatch, getState) {
    dispatch(deletingFeedSource())
    const url = '/api/manager/secure/feedsource/' + feedSource.id
    return secureFetch(url, getState(), 'delete')
      .then((res) => {
        return dispatch(fetchProjectFeeds(feedSource.projectId))
      })
  }
}

export function requestingFeedSource() {
  return {
    type: 'REQUESTING_FEEDSOURCE'
  }
}

export function fetchFeedSourceAndProject(feedSourceId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSource())
    const url = '/api/manager/secure/feedsource/' + feedSourceId
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(feedSource => {
        dispatch(fetchProject(feedSource.projectId))
        return feedSource
      })
  }
}

export function runningFetchFeed() {
  return {
    type: 'RUNNING_FETCH_FEED'
  }
}

export function runFetchFeed(feedSource) {
  return function (dispatch, getState) {
    dispatch(runningFetchFeed())
    const url = `/api/manager/secure/feedsource/${feedSource.id}/fetch`
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(result => {
        console.log('fetchFeed result', result)
        dispatch(fetchFeedVersions(feedSource))
      })
  }
}

export function requestingFeedVersions() {
  return {
    type: 'REQUESTING_FEEDVERSIONS'
  }
}

export function receiveFeedVersions(feedSource, feedVersions) {
  return {
    type: 'RECEIVE_FEEDVERSIONS',
    feedSource,
    feedVersions
  }
}

export function fetchFeedVersions(feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersions())
    const url = `/api/manager/secure/feedversion?feedSourceId=${feedSource.id}`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(versions => {
        dispatch(receiveFeedVersions(feedSource, versions))
      })
  }
}
