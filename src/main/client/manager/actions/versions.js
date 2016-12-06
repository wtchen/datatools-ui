import qs from 'qs'
import fetch from 'isomorphic-fetch'

import { secureFetch } from '../../common/util/util'
import { setErrorMessage, startJobMonitor } from './status'
import { fetchFeedSource } from './feeds'

export function requestingFeedVersions () {
  return {
    type: 'REQUESTING_FEEDVERSIONS'
  }
}

export function receiveFeedVersions (feedSource, feedVersions) {
  return {
    type: 'RECEIVE_FEEDVERSIONS',
    feedSource,
    feedVersions
  }
}

export function setActiveVersion (feedVersion) {
  return {
    type: 'SET_ACTIVE_FEEDVERSION',
    feedVersion
  }
}

export function fetchFeedVersions (feedSource, unsecured) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersions())
    const apiRoot = unsecured ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/feedversion?feedSourceId=${feedSource.id}`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(versions => {
        dispatch(receiveFeedVersions(feedSource, versions))
        return versions
      })
  }
}

export function requestingFeedVersion () {
  return {
    type: 'REQUESTING_FEEDVERSION'
  }
}

export function receiveFeedVersion (feedVersion) {
  return {
    type: 'RECEIVE_FEEDVERSION',
    feedVersion
  }
}

export function fetchFeedVersion (feedVersionId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersion())
    const url = `/api/manager/secure/feedversion/${feedVersionId}`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(version => {
        return dispatch(receiveFeedVersion(version))
      })
  }
}

export function publishingFeedVersion (feedVersion) {
  return {
    type: 'PUBLISHING_FEEDVERSION',
    feedVersion
  }
}

export function publishedFeedVersion (feedVersion) {
  return {
    type: 'PUBLISHED_FEEDVERSION',
    feedVersion
  }
}

export function publishFeedVersion (feedVersion) {
  return function (dispatch, getState) {
    dispatch(publishingFeedVersion(feedVersion))
    const url = `/api/manager/secure/feedversion/${feedVersion.id}/publish`
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(version => {
        return dispatch(publishedFeedVersion(version))
      })
  }
}

export function fetchPublicFeedVersions (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersions())
    const url = `/api/manager/public/feedversion?feedSourceId=${feedSource.id}&public=true`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(versions => {
        dispatch(receiveFeedVersions(feedSource, versions))
      })
  }
}

// Upload a GTFS File as a new FeedVersion

export function uploadingFeed (feedSource, file) {
  return {
    type: 'UPLOADING_FEED',
    feedSource,
    file
  }
}

export function uploadedFeed (feedSource) {
  return {
    type: 'UPLOADED_FEED',
    feedSource
  }
}

export function feedNotModified (feedSource, message) {
  return {
    type: 'FEED_NOT_MODIFIED',
    feedSource,
    message
  }
}

export function uploadFeed (feedSource, file) {
  return function (dispatch, getState) {
    dispatch(uploadingFeed(feedSource, file))
    const url = `/api/manager/secure/feedversion?feedSourceId=${feedSource.id}&lastModified=${file.lastModified}`

    var data = new window.FormData()
    data.append('file', file)

    return fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + getState().user.token },
      body: data
    }).then(res => {
      if (res.status === 304) {
        dispatch(feedNotModified(feedSource, 'Feed upload cancelled because it matches latest feed version.'))
      } else if (res.status >= 400) {
        dispatch(setErrorMessage('Error uploading feed source'))
      } else {
        dispatch(uploadedFeed(feedSource))
        dispatch(startJobMonitor())
      }
      console.log('uploadFeed result', res)

      // fetch feed source with versions
      return dispatch(fetchFeedSource(feedSource.id, true))
    })
  }
}

export function deletingFeedVersion (feedVersion) {
  return {
    type: 'DELETING_FEEDVERSION',
    feedVersion
  }
}

export function deleteFeedVersion (feedVersion, changes) {
  return function (dispatch, getState) {
    dispatch(deletingFeedVersion(feedVersion))
    const url = '/api/manager/secure/feedversion/' + feedVersion.id
    return secureFetch(url, getState(), 'delete')
      .then((res) => {
        // fetch feed source with versions
        return dispatch(fetchFeedSource(feedVersion.feedSource.id, true))
      })
  }
}
export function requestingValidationResult (feedVersion) {
  return {
    type: 'REQUESTING_VALIDATION_RESULT',
    feedVersion
  }
}
export function receiveValidationResult (feedVersion, validationResult) {
  return {
    type: 'RECEIVE_VALIDATION_RESULT',
    feedVersion,
    validationResult
  }
}
export function fetchValidationResult (feedVersion, isPublic) {
  return function (dispatch, getState) {
    dispatch(requestingValidationResult(feedVersion))
    const route = isPublic ? 'public' : 'secure'
    const url = `/api/manager/${route}/feedversion/${feedVersion.id}/validation`
    return secureFetch(url, getState())
    .then(response => response.json())
    .then(result => {
      dispatch(receiveValidationResult(feedVersion, result))
    })
  }
}

export function requestingFeedVersionIsochrones () {
  return {
    type: 'REQUESTING_FEEDVERSION_ISOCHRONES'
  }
}

export function receiveFeedVersionIsochrones (feedSource, feedVersion, isochrones) {
  return {
    type: 'RECEIVE_FEEDVERSION_ISOCHRONES',
    feedSource,
    feedVersion,
    isochrones
  }
}

export function fetchFeedVersionIsochrones (feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime) {
  return function (dispatch, getState) {
    if (typeof date === 'undefined' || typeof fromTime === 'undefined' || typeof toTime === 'undefined') {
      date = getState().gtfs.filter.dateTimeFilter.date
      fromTime = getState().gtfs.filter.dateTimeFilter.from
      toTime = getState().gtfs.filter.dateTimeFilter.to
    }
    dispatch(requestingFeedVersionIsochrones())
    const params = {fromLat, fromLon, toLat, toLon, date, fromTime, toTime}
    const url = `/api/manager/secure/feedversion/${feedVersion.id}/isochrones?${qs.stringify(params)}`
    return secureFetch(url, getState())
      .then(res => {
        console.log(res.status)
        if (res.status === 202) {
          // dispatch(setStatus)
          console.log('building network')
          return []
        }
        return res.json()
      })
      .then(isochrones => {
        console.log('received isochrones ', isochrones)
        dispatch(receiveFeedVersionIsochrones(feedVersion.feedSource, feedVersion, isochrones))
        return isochrones
      })
  }
}

// Download a GTFS file for a FeedVersion
export function downloadFeedViaToken (feedVersion, isPublic) {
  return function (dispatch, getState) {
    const route = isPublic ? 'public' : 'secure'
    const url = `/api/manager/${route}/feedversion/${feedVersion.id}/downloadtoken`
    secureFetch(url, getState())
    .then(response => response.json())
    .then(result => {
      window.location.assign(`/api/manager/downloadfeed/${result.id}`)
    })
  }
}

export function creatingFeedVersionFromSnapshot () {
  return {
    type: 'CREATING_FEEDVERSION_FROM_SNAPSHOT'
  }
}
export function createFeedVersionFromSnapshot (feedSource, snapshotId) {
  return function (dispatch, getState) {
    dispatch(creatingFeedVersionFromSnapshot())
    const url = `/api/manager/secure/feedversion/fromsnapshot?feedSourceId=${feedSource.id}&snapshotId=${snapshotId}`
    return secureFetch(url, getState(), 'post')
      .then((res) => {
        dispatch(startJobMonitor())
      })
  }
}

export function renamingFeedVersion () {
  return {
    type: 'RENAMING_FEEDVERSION'
  }
}

export function renameFeedVersion (feedVersion, name) {
  return function (dispatch, getState) {
    dispatch(renamingFeedVersion())
    const url = `/api/manager/secure/feedversion/${feedVersion.id}/rename?name=${name}`
    return secureFetch(url, getState(), 'put')
      .then((res) => {
        dispatch(fetchFeedVersion(feedVersion.id))
      })
  }
}
