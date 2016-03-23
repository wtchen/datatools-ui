import React from 'react'
import { connect } from 'react-redux'

import FeedSourceViewer from '../components/FeedSourceViewer'

import { fetchFeedSourceAndProject } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  let feedSourceId = ownProps.routeParams.feedSourceId

  // find the containing project
  let project = state.projects.all.find(p => {
    if (!p.feedSources) return false
    return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
  })

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
      if (!initialProps.feedSource) dispatch(fetchFeedSourceAndProject(feedSourceId))
    }
  }
}

const ActiveFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedSourceViewer)

export default ActiveFeedSourceViewer
