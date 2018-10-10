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
  deleteFeedSource,
  fetchProjectFeeds,
  runFetchFeed,
  saveFeedSource,
  updateFeedSource
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

const mapStateToProps = (state, ownProps) => {
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
  onComponentMount: onProjectViewerMount,
  createDeploymentFromFeedSource,
  deleteFeedSource,
  deleteProject,
  deleteDeploymentConfirmed: deleteDeployment,
  fetchProjectDeployments,
  deployPublic,
  downloadMergedFeed: downloadFeedForProject,
  fetchFeed: runFetchFeed,
  saveDeployment,
  createDeployment,
  createFeedSource,
  saveFeedSource,
  searchTextChanged: setVisibilitySearchText,
  thirdPartySync,
  updateFeedSource,
  updateAllFeeds: fetchFeedsForProject,
  updateDeployment,
  updateProject,
  uploadFeed,
  visibilityFilterChanged: setVisibilityFilter
}

const ActiveProjectViewer = connect(mapStateToProps, mapDispatchToProps)(
  ProjectViewer
)

export default ActiveProjectViewer
