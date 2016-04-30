import React from 'react'
import { connect } from 'react-redux'

import GtfsValidationMap from '../../components/validation/GtfsValidationMap'

import {
  fetchFeedSource,
  fetchFeedVersionIsochrones,
  fetchFeedSourceAndProject,
  updateFeedSource,
  runFetchFeed,
  fetchFeedVersions,
  uploadFeed,
  fetchPublicFeedSource,
  receiveFeedVersions,
  fetchPublicFeedVersions,
  updateExternalFeedResource,
  deleteFeedVersion,
  fetchValidationResult,
  downloadFeedViaToken,
  fetchNotesForFeedSource,
  postNoteForFeedSource,
  fetchNotesForFeedVersion,
  postNoteForFeedVersion
} from '../../actions/feeds'

import { updateTargetForSubscription } from '../../actions/user'

import { downloadGtfsPlusFeed } from '../../../gtfsplus/actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId
  let feedVersionId = ownProps.routeParams.feedVersionId
  let user = state.user
  // find the containing project
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.feedSources) return false
        return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
      })
    : null

  let feedSource, version
  if (project) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }
  if (feedSource && feedSource.feedVersions) {
    version = feedSource.feedVersions.find(v => v.id === feedVersionId)
  }
  return {
    version,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const feedVersionId = ownProps.routeParams.feedVersionId
  return {
    onComponentMount: (initialProps) => {
      let unsecured = true
      if (initialProps.user.profile !== null) {
        unsecured = false
      }
      if (!initialProps.project) {
        dispatch(fetchFeedSourceAndProject(feedSourceId, unsecured))
        .then((feedSource) => {
          console.log(feedSource)
          return dispatch(fetchFeedVersions(feedSource, unsecured))
        })
        .then((feedVersions) => {
          console.log(feedVersions)
          let version = feedVersions.find(v => v.id === feedVersionId)
          dispatch(fetchValidationResult(version.feedSource, version))
        })
      }
      else if (!initialProps.feedSource) {
        dispatch(fetchFeedSource(feedSourceId))
        .then((feedSource) => {
          console.log(feedSource)
          return dispatch(fetchFeedVersions(feedSource, unsecured))
        })
        .then((feedVersions) => {
          console.log(feedVersions)
          let version = feedVersions.find(v => v.id === feedVersionId)
          dispatch(fetchValidationResult(version.feedSource, version))
        })
      }
      else if (!initialProps.feedSource.versions) {
        dispatch(fetchFeedVersions(initialProps.feedSource, unsecured))
        .then((feedVersions) => {
          console.log(feedVersions)
          let version = feedVersions.find(v => v.id === feedVersionId)
          dispatch(fetchValidationResult(version.feedSource, version))
        })
      }
      else if (!initialProps.feedSource.versions.validationResult) {
        // dispatch(fetchValidationResult(version.feedSource, version))
      }
    },
    fetchIsochrones: (feedVersion, fromLat, fromLon, toLat, toLon) => {
      dispatch(fetchFeedVersionIsochrones(feedVersion, fromLat, fromLon, toLat, toLon))
    },
  }
}

const ActiveGtfsValidationMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsValidationMap)

export default ActiveGtfsValidationMap
