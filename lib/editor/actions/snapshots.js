import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import {getConfigProperty} from '../../common/util/config'
import {handleJobResponse} from '../../manager/actions/status'
import {downloadS3Key} from '../../manager/actions/versions'

const requestingSnapshots = createAction('REQUESTING_GTFSEDITOR_SNAPSHOTS')
const receiveSnapshots = createAction('RECEIVE_GTFSEDITOR_SNAPSHOTS')
const restoringSnapshot = createAction('RESTORING_SNAPSHOT')
const creatingSnapshot = createAction('CREATING_SNAPSHOT')
const downloadingSnapshot = createAction('DOWNLOADING_SNAPSHOT')
const loadingFeedVersionForEditing = createAction('LOADING_FEEDVERSION_FOR_EDITING')
const deletingSnapshot = createAction('DELETING_SNAPSHOT')

export function fetchSnapshots (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingSnapshots(feedSource))
    const url = `/api/editor/secure/snapshot?feedId=${feedSource.id}`
    return dispatch(secureFetch(url))
      .then(res => res.json())
      .then(snapshots => dispatch(receiveSnapshots({feedSource, snapshots})))
  }
}

/**
 * Restores a snapshot into the active editor buffer. On the backend, this is
 * creating a copy of the snapshotted tables and then setting the feed source's
 * active buffer to those new tables.
 */
export function restoreSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(restoringSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}/restore?feedId=${feedSource.id}`
    return dispatch(secureFetch(url, 'post'))
      .then(res => dispatch(handleJobResponse(res, 'Error restoring snapshot')))
  }
}

/**
 * Initializes download snapshot job, which handles converting an editor snapshot
 * into a GTFS file. After the job is complete, the UI will handle downloading
 * the file.
 */
export function downloadSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(downloadingSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}/download?feedId=${feedSource.id}`
    return dispatch(secureFetch(url))
      .then(res => dispatch(handleJobResponse(res, 'Error downloading snapshot')))
  }
}

/**
 * Download a GTFS file for a snapshot using credentials supplied by backend.
 */
export function downloadSnapshotViaCredentials (snapshot, isPublic, prefix) {
  return function (dispatch, getState) {
    const route = isPublic ? 'public' : 'secure'
    const url = `/api/editor/${route}/snapshot/${snapshot.id}/downloadtoken?feedId=${snapshot.feedSourceId}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(credentials => {
        if (getConfigProperty('application.data.use_s3_storage')) {
          dispatch(downloadS3Key(credentials, `${snapshot.id}.zip`, 'snapshots'))
        } else {
          // use token to download feed
          window.location.assign(`/api/editor/downloadsnapshot/${credentials.id}`)
        }
      })
  }
}

/**
 * Create a new snapshot from the data currently present in the editor buffer.
 *
 * FIXME: Name is not currently being writtern to back end.
 */
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
      .then(res => dispatch(handleJobResponse(res, 'Error creating snapshot')))
  }
}

/**
 * Fetch call to permanently delete the snapshot specified.
 */
export function deleteSnapshot (feedSource, snapshot) {
  return function (dispatch, getState) {
    dispatch(deletingSnapshot({feedSource, snapshot}))
    const url = `/api/editor/secure/snapshot/${snapshot.id}?feedId=${feedSource.id}`
    return dispatch(secureFetch(url, 'delete'))
      .then((response) => response.json())
      .then(snapshot => dispatch(fetchSnapshots(feedSource)))
  }
}

/**
 * "Imports" specified feed version into the editor. On the back end, this is
 * triggers a snapshot of the feed version's tables and sets the editor namespace
 * for the version's parent feed source.
 */
export function loadFeedVersionForEditing ({feedSourceId, feedVersionId}) {
  return function (dispatch, getState) {
    dispatch(loadingFeedVersionForEditing({feedSourceId, feedVersionId}))
    const url = `/api/editor/secure/snapshot/import?feedId=${feedSourceId}&feedVersionId=${feedVersionId}`
    return dispatch(secureFetch(url, 'post'))
      .then(res => dispatch(handleJobResponse(res)))
  }
}
