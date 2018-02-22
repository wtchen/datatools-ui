import {createAction} from 'redux-actions'

import {secureFetch} from '../../common/actions'
import {fetchProject, fetchProjectWithFeeds} from './projects'
import {handleJobResponse} from './status'
import {fetchFeedVersions} from './versions'
import {fetchSnapshots} from '../../editor/actions/snapshots'

// Private actions
const requestingFeedSource = createAction('REQUESTING_FEEDSOURCE')
const requestingFeedSources = createAction('REQUESTING_FEEDSOURCES')
const receiveFeedSources = createAction('RECEIVE_FEEDSOURCES')
const deletingFeedSource = createAction('DELETING_FEEDSOURCE')
// FIXME: Is receivePublicFeeds needed for the public UI?
// const receivePublicFeeds = createAction('RECEIVE_PUBLIC_FEEDS')
const savingFeedSource = createAction('SAVING_FEEDSOURCE')
const runningFetchFeed = createAction('RUNNING_FETCH_FEED')

// Public action used by component or other actions
export const receiveFeedSource = createAction('RECEIVE_FEEDSOURCE')
export const createFeedSource = createAction('CREATE_FEEDSOURCE')

/**
 * Fetch all feeds for a given project ID.
 */
export function fetchProjectFeeds (projectId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSources({projectId}))
    const url = `/api/manager/secure/feedsource?projectId=${projectId}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(feedSources => dispatch(receiveFeedSources({projectId, feedSources})))
  }
}

/**
 * Fetch all feeds user has permission to view.
 */
export function fetchUserFeeds (userId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSources({userId}))
    const url = '/api/manager/secure/feedsource?userId=' + userId
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(feedSources => dispatch(receiveFeedSources({feedSources})))
  }
}

/**
 * Create new feed source from provided properties.
 */
export function saveFeedSource (properties) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource({properties}))
    const url = '/api/manager/secure/feedsource'
    return dispatch(secureFetch(url, 'post', properties))
      .then((res) => dispatch(fetchProjectWithFeeds(properties.projectId)))
  }
}

/**
 * Update existing feed source with provided properties. Then re-fetch versions
 * and snapshots for feed source.
 */
export function updateFeedSource (feedSource, properties) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource({feedSource, properties}))
    const url = '/api/manager/secure/feedsource/' + feedSource.id
    return dispatch(secureFetch(url, 'put', properties))
      // Re-fetch feed source with versions and snapshots.
      .then((res) => dispatch(fetchFeedSource(feedSource.id, true, true)))
  }
}

/**
 * Update "external feed resource" properties, i.e., MTC, TransitLand, and
 * TransitFeeds.com.
 */
export function updateExternalFeedResource (feedSource, resourceType, properties) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource({feedSource, resourceType, properties}))
    const url = `/api/manager/secure/feedsource/${feedSource.id}/updateExternal?resourceType=${resourceType}`
    return dispatch(secureFetch(url, 'put', properties))
      .then((res) => res.json())
      .then(json => dispatch(fetchFeedSource(feedSource.id, true, true)))
  }
}

/**
 * Permanently delete single feed source. Re-fetches parent project's feeds
 * after deletion.
 */
export function deleteFeedSource (feedSource) {
  return function (dispatch, getState) {
    dispatch(deletingFeedSource(feedSource))
    const url = `/api/manager/secure/feedsource/${feedSource.id}`
    return dispatch(secureFetch(url, 'delete'))
      .then(res => dispatch(fetchProjectFeeds(feedSource.projectId)))
  }
}

/**
 * Get feed source for specified ID. This requests the feed source object from
 * the server and should not be confused with runFetchFeed, which attempts to
 * create a new feed version for the feed source by fetching the GTFS file at the
 * feed source fetch URL. This action will optionally fetch the feed source's
 * versions and snapshots following the successful feed source fetch.
 */
export function fetchFeedSource (feedSourceId, withVersions = false, withSnapshots = false) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSource(feedSourceId))
    const url = `/api/manager/secure/feedsource/${feedSourceId}`
    return dispatch(secureFetch(url))
      .then(res => res.json())
      .then(feedSource => {
        if (!feedSource) {
          // Feed source not found for ID
          dispatch(receiveFeedSource(null))
          return null
        }
        dispatch(receiveFeedSource(feedSource))
        if (withVersions) dispatch(fetchFeedVersions(feedSource))
        if (withSnapshots) dispatch(fetchSnapshots(feedSource))
        return feedSource
      })
  }
}

/**
 * Fetches feed source and parent project.
 */
export function fetchFeedSourceAndProject (feedSourceId, unsecured) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSource(feedSourceId))
    const apiRoot = unsecured ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/feedsource/${feedSourceId}`
    return dispatch(secureFetch(url))
      .then(res => res.json())
      .then(feedSource => {
        if (!feedSource) {
          console.error(`Could not fetch feed source for id: ${feedSourceId}`)
          return
        }
        return dispatch(fetchProject(feedSource.projectId, unsecured))
          .then(proj => {
            dispatch(receiveFeedSource(feedSource))
            return feedSource
          })
      })
  }
}

// FIXME: This is currently unused. Does it have an endpoint and is it needed for
// the public UI?
// export function fetchPublicFeedSource (feedSourceId) {
//   return function (dispatch, getState) {
//     dispatch(requestingFeedSource(feedSourceId))
//     const url = `/api/manager/public/feedsource/${feedSourceId}`
//     return dispatch(secureFetch(url))
//       .then(response => response.json())
//       .then(feedSource => {
//         dispatch(receivePublicFeeds())
//         return feedSource
//       })
//   }
// }

/**
 * Check for new GTFS file at feed source fetch URL and create new version from
 * the GTFS file if a new file is found.
 */
export function runFetchFeed (feedSource) {
  return function (dispatch, getState) {
    dispatch(runningFetchFeed(feedSource))
    const url = `/api/manager/secure/feedsource/${feedSource.id}/fetch`
    return dispatch(secureFetch(url, 'post'))
      .then(res => dispatch(handleJobResponse(res, 'Error fetching feed source')))
  }
}
