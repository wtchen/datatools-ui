import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import ProjectViewer from '../components/ProjectViewer'

import { setVisibilitySearchText } from '../actions/visibilityFilter'
import {
  fetchProject,
  thirdPartySync,
  fetchFeedsForProject,
  updateProject,
  downloadFeedForProject
   } from '../actions/projects'
import {
  fetchProjectFeeds,
  createFeedSource,
  saveFeedSource,
  updateFeedSource,
  runFetchFeed,
  deleteFeedSource,
  uploadFeed
} from '../actions/feeds'

import {
  fetchProjectDeployments,
  createDeployment,
  createDeploymentFromFeedSource,
  saveDeployment,
  deleteDeployment,
  updateDeployment
} from '../actions/deployments'

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
        .then(project => {
          dispatch(fetchProjectFeeds(projectId))
        })
      }
      else if (!initialProps.project.feedSources || initialProps.project.feedSources.length !== initialProps.project.numberOfFeeds) dispatch(fetchProjectFeeds(projectId))
    },
    onNewFeedSourceClick: () => { dispatch(createFeedSource(projectId)) },
    updateProjectSettings: (project, newSettings) => { dispatch(updateProject(project, newSettings)) }, // dispatch(updateProject(project, { [propName] : newValue }))
    thirdPartySync: (type) => { dispatch(thirdPartySync(projectId, type)) },
    updateAllFeeds: (project) => { dispatch(fetchFeedsForProject(project)) },
    newFeedSourceNamed: (name) => { dispatch(saveFeedSource({ projectId, name })) },
    feedSourcePropertyChanged: (feedSource, propName, newValue) => {
      dispatch(updateFeedSource(feedSource, { [propName]: newValue }))
    },
    deploymentsRequested: () => { dispatch(fetchProjectDeployments(projectId)) },
    createDeploymentFromFeedSource: (feedSource) => {
      dispatch(createDeploymentFromFeedSource(feedSource))
      .then((deployment) => {
        browserHistory.push(`/deployment/${deployment.id}`)
      })
    },
    onNewDeploymentClick: () => { dispatch(createDeployment(projectId)) },
    newDeploymentNamed: (name) => { dispatch(saveDeployment({ projectId, name })) },
    updateDeployment: (deployment, changes) => { dispatch(updateDeployment(deployment, changes)) },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text)) },
    uploadFeedClicked: (feedSource, file) => { dispatch(uploadFeed(feedSource, file)) },
    updateFeedClicked: (feedSource) => { dispatch(runFetchFeed(feedSource)) },
    deleteFeedSourceConfirmed: (feedSource) => { dispatch(deleteFeedSource(feedSource)) },
    deleteDeploymentConfirmed: (deployment) => { dispatch(deleteDeployment(deployment)) },
    downloadMergedFeed: (project) => { dispatch(downloadFeedForProject(project)) }
  }
}

const ActiveProjectViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectViewer)

export default ActiveProjectViewer
