import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import {fetchBaseGtfs} from './editor'
import {clearGtfsContent} from './active'
import {handleFetchError, startJobMonitor} from '../../manager/actions/status'
import {getConfigProperty} from '../../common/util/config'
import {downloadS3Key} from '../../manager/actions/versions'

const requestingSnapshots = createAction('REQUESTING_GTFSEDITOR_SNAPSHOTS')
const receiveSnapshots = createAction('RECEIVE_GTFSEDITOR_SNAPSHOTS')
const restoringSnapshot = createAction('RESTORING_SNAPSHOT')
const restoredSnapshot = createAction('RESTORED_SNAPSHOT')
const creatingSnapshot = createAction('CREATING_SNAPSHOT')
const createdSnapshot = createAction('CREATED_SNAPSHOT')
const downloadingSnapshot = createAction('DOWNLOADING_SNAPSHOT')
// const downloadedSnapshot = createAction('DOWNLOADED_SNAPSHOT')
const loadingFeedVersionForEditing = createAction('LOADING_FEEDVERSION_FOR_EDITING')
const deletingSnapshot = createAction('DELETING_SNAPSHOT')

export function fetchSnapshots (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingSnapshots(feedSource))
    const url = `/api/editor/secure/snapshot?feedId=${feedSource.id}`
    return dispatch(secureFetch(url, 'get'))
      .then((response) => {
        return response.json()
      }).then((snapshots) => {
        dispatch(receiveSnapshots({feedSource, snapshots}))
      })
  }
}

export function restoreSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(restoringSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}/restore?feedId=${feedSource.id}`
    return dispatch(secureFetch(url, 'post'))
      .then((response) => {
        return response.json()
      }).then((stops) => {
        dispatch(restoredSnapshot(snapshot.name))
        dispatch(fetchSnapshots(feedSource))
        dispatch(clearGtfsContent())
        dispatch(fetchBaseGtfs({namespace: feedSource.editorNamespace}))
      })
  }
}

export function downloadSnapshotViaToken (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(downloadingSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}/downloadtoken?feedId=${feedSource.id}`
    dispatch(secureFetch(url))
    .then((response) => response.json())
    .then((credentials) => {
      if (getConfigProperty('application.data.use_s3_storage')) {
        dispatch(downloadS3Key(credentials, `${snapshot.feedId}_${snapshot.snapshotTime}.zip`, 'snapshots'))
      } else {
        // use token to download feed
        window.location.assign(`/api/editor/downloadsnapshot/${credentials.id}?feedId=${feedSource.id}`)
      }
    })
  }
}

export function createSnapshot (feedSource, name, comment) {
  return function (dispatch, getState) {
    const url = `/api/editor/secure/snapshot?feedId=${feedSource.id}`
    const snapshot = {
      feedId: feedSource.id,
      name,
      comment
    }
    dispatch(creatingSnapshot({feedSource, snapshot}))
    return dispatch(secureFetch(url, 'post', snapshot))
      .then((response) => response.json())
      .then(() => {
        dispatch(createdSnapshot(name))
        return dispatch(fetchSnapshots(feedSource))
      })
  }
}

export function deleteSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(deletingSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}?feedId=${feedSource.id}`
    return dispatch(secureFetch(url, 'delete'))
      .then((response) => response.json())
      .then(() => dispatch(fetchSnapshots(feedSource)))
  }
}

export function loadFeedVersionForEditing (feedVersion) {
  return function (dispatch, getState) {
    dispatch(loadingFeedVersionForEditing(feedVersion))
    const url = `/api/editor/secure/snapshot/import?feedId=${feedVersion.feedSource.id}&feedVersionId=${feedVersion.id}`
    return dispatch(secureFetch(url, 'post'))
      .then((res) => {
        if (res.status >= 400) {
          return res.json()
        }
        dispatch(startJobMonitor())
        return res.json()
      }).then((json) => {
        if (json.code >= 400) {
          dispatch(handleFetchError(json.message))
        } else {
          dispatch(fetchSnapshots(feedVersion.feedSource))
        }
      })
  }
}
