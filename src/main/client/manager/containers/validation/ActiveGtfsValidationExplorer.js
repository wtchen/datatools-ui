import React from 'react'
import { connect } from 'react-redux'

import GtfsValidationExplorer from '../../components/validation/GtfsValidationExplorer'

import {
  fetchFeedSourceAndProject,
  fetchFeedVersions,
  fetchValidationResult,
  fetchFeedVersionIsochrones
} from '../../actions/feeds'

import { updateTargetForSubscription } from '../../actions/user'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId
  let feedVersionIndex = ownProps.routeParams.feedVersionIndex
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
    version = feedSource.feedVersions[feedVersionIndex-1]
  }
  return {
    version,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const feedVersionIndex = ownProps.routeParams.feedVersionIndex

  return {
    onComponentMount: (initialProps) => {
      let unsecured = true
      if (initialProps.user.profile !== null) {
        unsecured = false
      }

      if (!initialProps.project) { // loaded directly via URL
        dispatch(fetchFeedSourceAndProject(feedSourceId, unsecured))
        .then((feedSource) => {
          return dispatch(fetchFeedVersions(feedSource, unsecured))
        })
        .then((feedVersions) => {
          let version = feedVersions[feedVersionIndex - 1]
          dispatch(fetchValidationResult(version.feedSource, version))
        })
      }
    },
    fetchValidationResult: (feedVersion) => {
      dispatch(fetchValidationResult(feedVersion.feedSource, feedVersion))
    },
    fetchIsochrones: (feedVersion, fromLat, fromLon, toLat, toLon) => {
      dispatch(fetchFeedVersionIsochrones(feedVersion, fromLat, fromLon, toLat, toLon))
    },
  }
}

const ActiveGtfsValidationExplorer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsValidationExplorer)

export default ActiveGtfsValidationExplorer
