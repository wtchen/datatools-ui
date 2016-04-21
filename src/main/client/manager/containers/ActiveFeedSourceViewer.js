import React from 'react'
import { connect } from 'react-redux'

import FeedSourceViewer from '../components/FeedSourceViewer'

import {
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
} from '../actions/feeds'

import { downloadGtfsPlusFeed } from '../../gtfsplus/actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId
  let user = state.user
  // find the containing project
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.feedSources) return false
        return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
      })
    : null

  let feedSource
  if (project) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }

  return {
    feedSource,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
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
          dispatch(fetchFeedVersions(feedSource, unsecured))
        })
      }
      else if(!initialProps.feedSource) {
        dispatch(fetchFeedSource(initialProps.feedSource, unsecured))
        .then((feedSource) => {
          dispatch(fetchFeedVersions(feedSource, unsecured))
        })
      }
      else if(!initialProps.feedSource.versions) {
        dispatch(fetchFeedVersions(initialProps.feedSource, unsecured))
      }
    },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    },
    externalPropertyChanged: (feedSource, resourceType, propName, newValue) => {
      dispatch(updateExternalFeedResource(feedSource, resourceType, { [propName]: newValue } ))
    },
    updateFeedClicked: (feedSource) => { dispatch(runFetchFeed(feedSource)) },
    uploadFeedClicked: (feedSource, file) => { dispatch(uploadFeed(feedSource, file)) },
    downloadFeedClicked: (feedVersion) => { dispatch(downloadFeedViaToken(feedVersion)) },
    deleteFeedVersionConfirmed: (feedSource, feedVersion) => {
      dispatch(deleteFeedVersion(feedSource, feedVersion))
    },
    validationResultRequested: (feedSource, feedVersion) => {
      dispatch(fetchValidationResult(feedSource, feedVersion))
    },
    notesRequestedForFeedSource: (feedSource) => {
      dispatch(fetchNotesForFeedSource(feedSource))
    },
    newNotePostedForFeedSource: (feedSource, note) => {
      dispatch(postNoteForFeedSource(feedSource, note))
    },
    notesRequestedForVersion: (feedVersion) => {
      dispatch(fetchNotesForFeedVersion(feedVersion))
    },
    newNotePostedForVersion: (version, note) => {
      dispatch(postNoteForFeedVersion(version, note))
    },
    gtfsPlusDataRequested: () => {
      dispatch(downloadGtfsPlusFeed(version.id))
    }
  }
}

const ActiveFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedSourceViewer)

export default ActiveFeedSourceViewer
