import React from 'react'
import { connect } from 'react-redux'

import ProjectViewer from '../components/ProjectViewer'

import { setVisibilitySearchText } from '../actions/visibilityFilter'
import { fetchProject, createFeedSource, saveFeedSource, updateFeedSource } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    project: state.projects.all.find(p => p.id === ownProps.routeParams.projectId),
    visibilitySearchText: state.visibilityFilter.searchText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const projectId = ownProps.routeParams.projectId
  return {
    onComponentMount: () => {
      dispatch(setVisibilitySearchText(null))
      dispatch(fetchProject(projectId))
    },
    onNewFeedSourceClick: () => { dispatch(createFeedSource(projectId)) },
    newFeedSourceNamed: (name) => {
      dispatch(saveFeedSource({ projectId, name }))
    },
    feedSourceNameChanged: (feedSource, newName) => {
      dispatch(updateFeedSource(feedSource, { name : newName }))
    },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))}
  }
}

const ActiveProjectViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewer)

export default ActiveProjectViewer
