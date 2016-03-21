import React from 'react'
import { connect } from 'react-redux'

import ProjectViewer from '../components/ProjectViewer'

import { fetchProjectFeeds } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  console.log('AVP', ownProps)
  return {
    //projects: state.projects
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (projectId) => { dispatch(fetchProjectFeeds(projectId)) },
    onNewFeedClick: () => { console.log('new feed') }
  }
}

const ActiveProjectViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewer)

export default ActiveProjectViewer
