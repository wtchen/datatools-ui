import React from 'react'
import { connect } from 'react-redux'

import ProjectViewer from '../components/ProjectViewer'

import { setVisibilitySearchText } from '../actions/visibilityFilter'
import {
  fetchProject,
  thirdPartySync,
  fetchFeedsForProject,
  updateProject
   } from '../actions/projects'
import {
  fetchProjectFeeds,
  createFeedSource,
  saveFeedSource,
  updateFeedSource,
  deleteFeedSource
} from '../actions/feeds'

import { updateTargetForSubscription } from '../../manager/actions/user'
import { fetchProjectDeployments, createDeployment, saveDeployment, deleteDeployment } from '../actions/deployments'

const mapStateToProps = (state, ownProps) => {
  return {
    project: state.projects.all
      ? state.projects.all.find(p => p.id === ownProps.routeParams.projectId)
      : null,
    visibilitySearchText: state.projects.filter.searchText,
    activeComponent: ownProps.routeParams.subpage,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const projectId = ownProps.routeParams.projectId
  return {
    onComponentMount: (initialProps) => {
      if (initialProps.user.profile === null) {
        return
      }
      dispatch(setVisibilitySearchText(null))
      if (!initialProps.project) {
        dispatch(fetchProject(projectId))
      }
      else if (!initialProps.project.feedSources || initialProps.project.feedSources.length !== initialProps.project.numberOfFeeds) dispatch(fetchProjectFeeds(projectId))
    },
    onNewFeedSourceClick: () => { dispatch(createFeedSource(projectId)) },
    updateProjectSettings: (project, newSettings) => { dispatch(updateProject(project, newSettings)) }, // dispatch(updateProject(project, { [propName] : newValue }))
    thirdPartySync: (type) => { dispatch(thirdPartySync(projectId, type)) },
    updateAllFeeds: (project) => { dispatch(fetchFeedsForProject(project)) },
    newFeedSourceNamed: (name) => { dispatch(saveFeedSource({ projectId, name })) },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    },
    updateUserSubscription: (profile, target, subscriptionType) => { dispatch(updateTargetForSubscription(profile, target, subscriptionType)) },
    deploymentsRequested: () => { dispatch(fetchProjectDeployments(projectId)) },
    onNewDeploymentClick: () => { dispatch(createDeployment(projectId)) },
    newDeploymentNamed: (name) => { dispatch(saveDeployment({ projectId, name })) },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))},
    deleteFeedSourceConfirmed: (feedSource) => { dispatch(deleteFeedSource(feedSource)) },
    deleteDeploymentConfirmed: (deployment) => { dispatch(deleteDeployment(deployment)) }
  }
}

const ActiveProjectViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewer)

export default ActiveProjectViewer
