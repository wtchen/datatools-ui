import React from 'react'
import { connect } from 'react-redux'

import ProjectViewer from '../components/ProjectViewer'

import { fetchProject, createFeedSource, saveFeedSource, updateFeedSource } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    project: state.projects.all.find(p => p.id === ownProps.routeParams.projectId)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const projectId = ownProps.routeParams.projectId
  return {
    onComponentMount: () => { dispatch(fetchProject(projectId)) },
    onNewFeedSourceClick: () => { dispatch(createFeedSource(projectId)) },
    newFeedSourceNamed: (name) => {
      dispatch(saveFeedSource({ projectId, name }))
    },
    feedSourceNameChanged: (feedSource, newName) => {
      dispatch(updateFeedSource(feedSource, { name : newName }))
    }
  }
}

const ActiveProjectViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewer)

export default ActiveProjectViewer
