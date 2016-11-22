import React from 'react'
import { connect } from 'react-redux'

import PublicFeedSourceViewer from '../components/PublicFeedSourceViewer'

import {
  fetchFeedSourceAndProject,
  updateFeedSource,
  runFetchFeed,
  fetchFeedVersions,
  uploadFeed
} from '../../manager/actions/feeds'

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
      if (!initialProps.feedSource) {
        dispatch(fetchFeedSourceAndProject(feedSourceId, unsecured))
        .then((feedSource) => {
          console.log('fetch versions')
          dispatch(fetchFeedVersions(feedSource, unsecured))
        })
      } else if (!initialProps.feedSource.versions) {
        dispatch(fetchFeedVersions(initialProps.feedSource, unsecured))
      }
    },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName]: newValue }))
    },
    updateFeedClicked: (feedSource) => { dispatch(runFetchFeed(feedSource)) },
    uploadFeedClicked: (feedSource, file) => { dispatch(uploadFeed(feedSource, file)) }
  }
}

const ActivePublicFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicFeedSourceViewer)

export default ActivePublicFeedSourceViewer
