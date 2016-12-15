import { secureFetch } from '../../common/util/util'
import { fetchBaseGtfs } from './editor'
import { clearGtfsContent } from './active'
import { startJobMonitor } from '../../manager/actions/status'

// SNAPSHOT ACTIONS

export function requestingSnapshots () {
  return {
    type: 'REQUESTING_GTFSEDITOR_SNAPSHOTS'
  }
}

export function receiveSnapshots (feedSource, snapshots) {
  return {
    type: 'RECEIVE_GTFSEDITOR_SNAPSHOTS',
    feedSource,
    snapshots
  }
}

export function fetchSnapshots (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingSnapshots())
    const url = `/api/manager/secure/snapshot?feedId=${feedSource.id}`
    return secureFetch(url, getState(), 'get')
      .then((response) => {
        return response.json()
      }).then((snapshots) => {
        dispatch(receiveSnapshots(feedSource, snapshots))
      })
  }
}

export function restoringSnapshot () {
  return {
    type: 'RESTORING_SNAPSHOT'
  }
}

export function restoredSnapshot (name) {
  return {
    type: 'RESTORED_SNAPSHOT',
    name
  }
}

export function restoreSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(restoringSnapshot())
    const url = `/api/manager/secure/snapshot/${snapshot.id}/restore`
    return secureFetch(url, getState(), 'post')
      .then((response) => {
        return response.json()
      }).then((stops) => {
        dispatch(restoredSnapshot(snapshot.name))
        dispatch(fetchSnapshots(feedSource))
        dispatch(clearGtfsContent())
        dispatch(fetchBaseGtfs(feedSource.id))
      })
  }
}

export function downloadingSnapshot (feedSource, snapshot) {
  return {
    type: 'DOWNLOADING_SNAPSHOT',
    feedSource,
    snapshot
  }
}

export function downloadedSnapshot (name) {
  return {
    type: 'DOWNLOADED_SNAPSHOT',
    name
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

export function downloadSnapshotViaToken (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(downloadingSnapshot(feedSource, snapshot))
    const url = `/api/manager/secure/snapshot/${snapshot.id}/downloadtoken`
    secureFetch(url, getState())
    .then((response) => response.json())
    .then((result) => {
      console.log(result)
      window.location.assign(`/api/manager/downloadsnapshot/${result.id}`)
    })
  }
}

export function creatingSnapshot () {
  return {
    type: 'CREATING_SNAPSHOT'
  }
}

export function createdSnapshot (name) {
  return {
    type: 'CREATED_SNAPSHOT',
    name
  }
}

export function createSnapshot (feedSource, name, comment) {
  return function (dispatch, getState) {
    dispatch(creatingSnapshot())
    const url = `/api/manager/secure/snapshot`
    const payload = {
      feedId: feedSource.id,
      name,
      comment
    }
    return secureFetch(url, getState(), 'post', payload)
      .then((response) => {
        return response.json()
      }).then(() => {
        dispatch(createdSnapshot(name))
      })
  }
}

export function deletingSnapshot () {
  return {
    type: 'DELETING_SNAPSHOT'
  }
}

export function deleteSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(deletingSnapshot())
    const url = `/api/manager/secure/snapshot/${snapshot.id}`
    return secureFetch(url, getState(), 'delete')
      .then((response) => {
        return response.json()
      }).then(() => {
        console.log('deleted!')
        dispatch(fetchSnapshots(feedSource))
      })
  }
}

export function loadingFeedVersionForEditing () {
  return {
    type: 'LOADING_FEEDVERSION_FOR_EDITING'
  }
}

export function loadFeedVersionForEditing (feedVersion, snapshot) {
  return function (dispatch, getState) {
    dispatch(loadingFeedVersionForEditing())
    const url = `/api/manager/secure/snapshot/import?feedVersionId=${feedVersion.id}`
    return secureFetch(url, getState(), 'post')
      .then((response) => {
        dispatch(startJobMonitor())
        return response.json()
      }).then(() => {
        dispatch(fetchSnapshots(feedVersion.feedSource))
      })
  }
}
