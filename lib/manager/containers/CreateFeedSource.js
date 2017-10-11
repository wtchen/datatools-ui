// @flow

import { connect } from 'react-redux'

import { createFeedSource } from '../actions/feeds'
import { fetchProject } from '../actions/projects'
import CreateFeedSource from '../components/CreateFeedSource'

const mapStateToProps = (state, ownProps) => {
  const {projectId} = ownProps.routeParams
  return {
    project: state.projects.all
      ? state.projects.all.find(p => p.id === projectId)
      : null,
    projectId,
    user: state.user
  }
}

const mapDispatchToProps = {
  createFeedSource,
  fetchProject
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateFeedSource)
