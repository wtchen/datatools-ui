// @flow

import {connect} from 'react-redux'

import {
  setVisibilitySearchText,
  setVisibilityFilter
} from '../actions/visibilityFilter'
import {
  deleteProject,
  deployPublic,
  downloadFeedForProject,
  fetchFeedsForProject,
  onProjectViewerMount,
  thirdPartySync,
  updateProject
} from '../actions/projects'
import {
  createFeedSource,
  saveFeedSource,
  updateFeedSource,
  runFetchFeed,
  deleteFeedSource
} from '../actions/feeds'
import {
  fetchProjectDeployments,
  createDeployment,
  createDeploymentFromFeedSource,
  saveDeployment,
  deleteDeployment,
  updateDeployment
} from '../actions/deployments'
import {uploadFeed} from '../actions/versions'
import ProjectViewer from '../components/ProjectViewer'

import type {AppState, RouteParams} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: { routeParams: RouteParams }) => {
  const {user} = state
  const {all, filter: visibilityFilter, isFetching} = state.projects
  const {
    projectId,
    subpage: activeComponent,
    subsubpage: activeSubComponent
  } = ownProps.routeParams
  const project = all ? all.find(p => p.id === projectId) : null
  return {
    project,
    projectId,
    visibilityFilter,
    activeComponent,
    activeSubComponent,
    user,
    isFetching
  }
}

const mapDispatchToProps = {
  createDeployment,
  createDeploymentFromFeedSource,
  createFeedSource,
  deleteDeployment,
  deleteFeedSource,
  deleteProject,
  deployPublic,
  downloadFeedForProject,
  fetchFeedsForProject,
  fetchProjectDeployments,
  onProjectViewerMount,
  runFetchFeed,
  saveDeployment,
  saveFeedSource,
  setVisibilityFilter,
  setVisibilitySearchText,
  thirdPartySync,
  updateDeployment,
  updateFeedSource,
  updateProject,
  uploadFeed
}

const ActiveProjectViewer = connect(mapStateToProps, mapDispatchToProps)(
  ProjectViewer
)

export default ActiveProjectViewer
