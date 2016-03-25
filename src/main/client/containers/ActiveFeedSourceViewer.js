import React from 'react'
import { connect } from 'react-redux'

import FeedSourceViewer from '../components/FeedSourceViewer'

import {
  fetchFeedSourceAndProject,
  updateFeedSource,
  runFetchFeed,
  fetchFeedVersions,
  uploadFeed
} from '../actions/feeds'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId

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
    project
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.feedSource) {
        dispatch(fetchFeedSourceAndProject(feedSourceId))
        .then((feedSource) => {
          console.log('fetch versions')
          dispatch(fetchFeedVersions(feedSource))
        })
      }
      else if(!initialProps.feedSource.versions) {
        dispatch(fetchFeedVersions(initialProps.feedSource))        
      }
    },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    },
    updateFeedClicked: (feedSource) => { dispatch(runFetchFeed(feedSource)) },
    uploadFeedClicked: (feedSource, file) => { dispatch(uploadFeed(feedSource, file)) }
  }
}

const ActiveFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedSourceViewer)

export default ActiveFeedSourceViewer
