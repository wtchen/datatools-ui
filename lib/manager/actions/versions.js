import qs from 'qs'
import {createAction} from 'redux-actions'
import {browserHistory} from 'react-router'

import {fetchGraphQL, secureFetch} from '../../common/actions'
import {SECURE_API_PREFIX} from '../../common/constants'
import {getConfigProperty} from '../../common/util/config'
import {uploadFile} from '../../common/util/upload-file'
import {ENTITY} from '../../editor/constants'
import {getKeyForId} from '../../editor/util/gtfs'
import {getEntityGraphQLRoot, getEntityIdField, getGraphQLFieldsForEntity} from '../../gtfs/util'
import {handleJobResponse, setErrorMessage, startJobMonitor} from './status'
import {fetchFeedSource} from './feeds'

export const requestingFeedVersions = createAction('REQUESTING_FEEDVERSIONS')
const requestingValidationIssueCount = createAction('REQUESTING_VALIDATION_ISSUE_COUNT')
const receiveValidationIssueCount = createAction('RECEIVE_VALIDATION_ISSUE_COUNT')
const fetchingValidationErrors = createAction('FETCHING_VALIDATION_ERRORS')
const receiveValidationErrors = createAction('RECEIVE_VALIDATION_ERRORS')
const fetchingGTFSEntities = createAction('FETCHING_GTFS_ENTITIES')
const receiveGTFSEntities = createAction('RECEIVE_GTFS_ENTITIES')
const renamingFeedVersion = createAction('RENAMING_FEEDVERSION')
const creatingFeedVersionFromSnapshot = createAction('CREATING_FEEDVERSION_FROM_SNAPSHOT')
const deletingFeedVersion = createAction('DELETING_FEEDVERSION')
const uploadingFeed = createAction('UPLOADING_FEED')
const receiveFeedVersions = createAction('RECEIVE_FEEDVERSIONS')
// setActiveVersion used in components
export const setActiveVersion = createAction('SET_ACTIVE_FEEDVERSION')
const requestingFeedVersion = createAction('REQUESTING_FEEDVERSION')
const receiveFeedVersion = createAction('RECEIVE_FEEDVERSION')
const publishingFeedVersion = createAction('PUBLISHING_FEEDVERSION')
const publishedFeedVersion = createAction('PUBLISHED_FEEDVERSION')

function requestingFeedVersionIsochrones (feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime) {
  return {
    type: 'REQUESTING_FEEDVERSION_ISOCHRONES',
    feedVersion,
    fromLat,
    fromLon,
    toLat,
    toLon,
    date,
    fromTime,
    toTime
  }
}

function receiveFeedVersionIsochrones (feedSource, feedVersion, isochrones, fromLat, fromLon, toLat, toLon, date, fromTime, toTime) {
  return {
    type: 'RECEIVE_FEEDVERSION_ISOCHRONES',
    feedSource,
    feedVersion,
    isochrones,
    fromLat,
    fromLon,
    toLat,
    toLon,
    date,
    fromTime,
    toTime
  }
}

export function fetchFeedVersions (feedSource, unsecured = false) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersions(feedSource))
    const apiRoot = unsecured ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/feedversion?feedSourceId=${feedSource.id}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(versions => {
        dispatch(receiveFeedVersions({feedSource, versions}))
        return versions
      })
  }
}

/**
 * Fetch feed version for the provided ID.
 */
export function fetchFeedVersion (feedVersionId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersion(feedVersionId))
    const url = `${SECURE_API_PREFIX}feedversion/${feedVersionId}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(version => {
        return dispatch(receiveFeedVersion(version))
      })
  }
}

/**
 * Currently an MTC-specific feature to "publish" feed version to third party
 * server. In the case of MTC, this tells the data tools backend to push this
 * version to the s3 bucket for processing by RTD.
 */
export function publishFeedVersion (feedVersion) {
  return function (dispatch, getState) {
    dispatch(publishingFeedVersion(feedVersion))
    const url = `${SECURE_API_PREFIX}feedversion/${feedVersion.id}/publish`
    return dispatch(secureFetch(url, 'post'))
      .then(response => response.json())
      .then(version => dispatch(publishedFeedVersion(version)))
  }
}

// FIXME Remove this unused public UI function?
export function fetchPublicFeedVersions (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingFeedVersions(feedSource))
    const url = `/api/manager/public/feedversion?feedSourceId=${feedSource.id}&public=true`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(versions => dispatch(receiveFeedVersions({feedSource, versions})))
  }
}

/**
 * Upload a GTFS file as a new feed version. This handles the server response if
 * the feed has not been modified since the latest version or there is some error
 * during the upload. If all goes well, the job monitor is started to watch the
 * job's progress.
 */
export function uploadFeed (feedSource, file) {
  return function (dispatch, getState) {
    dispatch(uploadingFeed(feedSource, file))
    const url = `${SECURE_API_PREFIX}feedversion?feedSourceId=${feedSource.id}&lastModified=${file.lastModified}`
    const {token} = getState().user
    return uploadFile({file, url, token})
    // FIXME: Use standard handleJobResponse for feed upload operation
      .then(res => {
        if (res.status === 304) {
          // 304 halt is thrown by server if uploaded feed matches the hash of
          // the latest version.
          dispatch(setErrorMessage({
            title: `Warning: Feed version for ${feedSource.name} not processed`,
            message: 'Feed upload cancelled because it matches latest feed version.'
          }))
        } else if (res.status >= 400) {
          // If there was some error during the upload (e.g., bad zip file),
          // show the error details.
          res.json()
            .then(json => {
              const {detail, message} = json
              dispatch(setErrorMessage({
                message: message || 'Error uploading feed source',
                detail
              }))
            })
        } else {
          // If no errors and this is a new feed, start job monitor to check
          // the progress of feed processing.
          dispatch(startJobMonitor())
        }
      })
  }
}

/**
 * Permanently delete the feed version object and the loaded GTFS data in the
 * SQL database.
 */
export function deleteFeedVersion (feedVersion) {
  return function (dispatch, getState) {
    dispatch(deletingFeedVersion(feedVersion))
    const url = `${SECURE_API_PREFIX}feedversion/${feedVersion.id}`
    return dispatch(secureFetch(url, 'delete'))
      .then((res) => {
        // Re-fetch feed source with versions + snapshots
        return dispatch(fetchFeedSource(feedVersion.feedSource.id, true, true))
      })
  }
}
/**
 * Fetch GTFS entities for the provided namespace using gtfs-lib GraphQL schema.
 * If an ID is provided, the ID will be passed as an argument to either the `id`
 * field (if fetching for the editor) or the "GTFS ID" field (elsewhere). If
 * fetching entities for the editor, all fields will be included in query (per
 * the behavior of getGraphQLFieldsForEntity).
 *
 * If no ID is provided (this includes id === 0, which should not be allowed in
 * the editor), the ID argument will be excluded.
 */

export function fetchGTFSEntities ({namespace, id, type, editor = false, replaceNew = false, patternId}) {
  return function (dispatch, getState) {
    // If fetching for the editor, query on id field (AKA csv_line)
    const entityIdField = editor ? 'id' : getEntityIdField(type)
    const idFieldType = editor ? 'Int' : '[String]'
    const graphQLRoot = getEntityGraphQLRoot(type)
    if (!graphQLRoot || !entityIdField) {
      console.warn(`No graphql table or filter field for ${type}`)
    }
    const fields = getGraphQLFieldsForEntity(type, editor)
    // If fetching for the editor, query on id which is an Int
    const query = `
      query entityQuery($namespace: String${id ? `, $${entityIdField}: ${idFieldType}` : ''}) {
        feed(namespace: $namespace) {
          feed_id
          feed_version
          filename
          ${graphQLRoot} (limit: -1${id ? `, ${entityIdField}: $${entityIdField}` : ''}) {
            id
            ${fields}
          }
        }
      }
    `
    dispatch(fetchingGTFSEntities({namespace, id, type, editor, query}))
    // If fetching for the editor, cast id to int for csv_line field
    return dispatch(fetchGraphQL({
      query,
      variables: {namespace, [entityIdField]: editor ? +id : id}
    }))
      .then(data => {
        dispatch(receiveGTFSEntities({namespace, id, component: type, data, editor, replaceNew}))
        if (editor) {
          // If fetching entities for the editor, check that the entity and pattern
          // IDs are valid and handle pushing new browser URL (if applicable).
          const activePatternId = patternId || getState().editor.data.active.subEntityId
          if (activePatternId !== ENTITY.NEW_ID) {
            // Only check pre-existing pattern IDs.
            checkEntityIdValidity(data, type, id, activePatternId)
          }
          if (replaceNew) {
            // Push the browser path to a URL containing the entity and pattern
            // IDs that were fetched.
            const {feedSourceId} = getState().editor.data.active
            // It is OK simply to push the new ID to the URL here because the
            // reducer on receiveGTFSEntities will handle updating the active
            // entity. Also, updating trips does not come through
            // this code path, so we don't need to handle setting the timetable active.
            let url = `/feed/${feedSourceId}/edit/${type}/${id}`
            if (patternId) url += `/trippattern/${patternId}`
            browserHistory.push(url)
          }
        }
      })
      .catch(err => console.log(err))
  }
}

/**
 * Check that entity and pattern IDs are valid and update URL if not.
 */
function checkEntityIdValidity (data, type, id, patternId) {
  const tableName = getKeyForId(type, 'tableName')
  const entity = data.feed[tableName][0]
  const pathParts = window.location.pathname.split('/')
  let entityNotFound = false
  if (!entity) {
    console.warn(`No ${type} entity found for id=${id}. Removing id from URL.`)
    entityNotFound = true
    while (pathParts[pathParts.length - 1] !== type) pathParts.pop()
  } else if (type === 'route' && patternId) {
    const pattern = entity.tripPatterns.find(p => p.id === patternId)
    if (!pattern) {
      console.warn(`No pattern entity found for id=${patternId}. Removing id from URL.`)
      entityNotFound = true
      pathParts.pop()
    }
  }
  if (entityNotFound) {
    // If there was no entity found for the requested ID, remove the ID
    // from the URL
    browserHistory.push(pathParts.join('/'))
  }
}

export function fetchValidationErrors ({feedVersion, errorType, limit, offset}) {
  return function (dispatch, getState) {
    dispatch(fetchingValidationErrors({feedVersion, errorType, limit, offset}))
    const query = `
      query errorsQuery($namespace: String, $errorType: [String], $limit: Int, $offset: Int) {
        feed(namespace: $namespace) {
          feed_id
          feed_version
          filename
          errors (error_type: $errorType, limit: $limit, offset: $offset) {
            error_type
            entity_type
            entity_id
            line_number
            bad_value
            entity_sequence
          }
        }
      }
    `
    const {namespace} = feedVersion
    return dispatch(fetchGraphQL({
      query,
      variables: {namespace, errorType: [errorType], limit, offset},
      errorMessage: 'Error fetching validation issues'
    }))
      .then(data => {
        if (data && data.feed) {
          const {errors} = data.feed
          dispatch(receiveValidationErrors({feedVersion, errorType, limit, offset, errors}))
        }
      })
  }
}

export function fetchValidationIssueCount (feedVersion) {
  return function (dispatch, getState) {
    dispatch(requestingValidationIssueCount(feedVersion))
    const {namespace} = feedVersion
    const query = `
      query countsQuery($namespace: String) {
        feed(namespace: $namespace) {
          feed_id
          feed_version
          filename
          row_counts {
            stops
            trips
            calendar_dates
            errors
          }
          error_counts {
            type count message
          }
        }
      }
    `
    return dispatch(fetchGraphQL({query, variables: {namespace}}))
      .then(data => {
        if (data.feed) {
          dispatch(receiveValidationIssueCount({feedVersion, validationResult: data.feed}))
        }
      })
      .catch(err => console.log(err))
  }
}

export function fetchFeedVersionIsochrones (feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime) {
  return function (dispatch, getState) {
    if (typeof date === 'undefined' || typeof fromTime === 'undefined' || typeof toTime === 'undefined') {
      const dateTimeFilter = getState().gtfs.filter
      date = dateTimeFilter.date
      fromTime = dateTimeFilter.from
      toTime = dateTimeFilter.to
    }
    dispatch(requestingFeedVersionIsochrones(feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime))
    const params = {fromLat, fromLon, toLat, toLon, date, fromTime, toTime}
    const url = `${SECURE_API_PREFIX}feedversion/${feedVersion.id}/isochrones?${qs.stringify(params)}`
    return dispatch(secureFetch(url))
      .then(res => {
        console.log(res.status)
        if (res.status === 202) {
          // Wait for transport network build job to finish
          dispatch(handleJobResponse(res, 'Error building transport network'))
          return []
        }
        return res.json()
      })
      .then(isochrones => {
        console.log('received isochrones ', isochrones)
        dispatch(receiveFeedVersionIsochrones(feedVersion.feedSource, feedVersion, isochrones, fromLat, fromLon, toLat, toLon, date, fromTime, toTime))
        return isochrones
      })
  }
}

/**
 * Download a GTFS file for a a given feed version.
 */
export function downloadFeedViaToken (feedVersion, isPublic, prefix = 'gtfs') {
  return function (dispatch, getState) {
    const route = isPublic ? 'public' : 'secure'
    const url = `/api/manager/${route}/feedversion/${feedVersion.id}/downloadtoken`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(json => {
        if (getConfigProperty('application.data.use_s3_storage')) {
          // Download object using presigned S3 URL.
          window.location.assign(json.url)
        } else {
          // Otherwise, use the provided token to download feed from the server.
          window.location.assign(`/api/manager/downloadfeed/${json.id}`)
        }
      })
  }
}

/**
 * Publish an existing snapshot as a new feed version for the specified feed
 * source. This allows a path for validating and downloading GTFS data contained
 * in the editor.
 */
export function createFeedVersionFromSnapshot (feedSource, snapshotId) {
  return function (dispatch, getState) {
    dispatch(creatingFeedVersionFromSnapshot({feedSource, snapshotId}))
    const url = `${SECURE_API_PREFIX}feedversion/fromsnapshot?feedSourceId=${feedSource.id}&snapshotId=${snapshotId}`
    return dispatch(secureFetch(url, 'post'))
      .then(res => dispatch(handleJobResponse(res, 'Error downloading snapshot')))
  }
}

/**
 * Rename the specified feed version. Note, there is no update method for feed
 * version objects because these should remain relatively untouched following
 * creation.
 */
export function renameFeedVersion (feedVersion, name) {
  return function (dispatch, getState) {
    dispatch(renamingFeedVersion(feedVersion))
    const url = `${SECURE_API_PREFIX}feedversion/${feedVersion.id}/rename?name=${name}`
    return dispatch(secureFetch(url, 'put'))
      .then((res) => {
        dispatch(fetchFeedVersion(feedVersion.id))
      })
  }
}
