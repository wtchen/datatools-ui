import React from 'react'
import { connect } from 'react-redux'

import DeploymentViewer from '../components/DeploymentViewer'
import { fetchDeployment, fetchDeploymentAndProject, fetchDeploymentTargets } from '../actions/deployments'

const mapStateToProps = (state, ownProps) => {
  let deploymentId = ownProps.routeParams.deploymentId
  let user = state.user
  let project = state.projects.all
    ? state.projects.all.find(p => {
        if (!p.deployments) return false
        return (p.deployments.findIndex(dep => dep.id === deploymentId) !== -1)
      })
    : null

  let deployment
  if (project) {
    deployment = project.deployments.find(dep => dep.id === deploymentId)
  }

  return {
    deployment,
    project,
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const deploymentId = ownProps.routeParams.deploymentId
  return {
    onComponentMount: (initialProps) => {
      if (initialProps.user.profile === null) {
        return
      }
      if (!initialProps.deployment) {
        dispatch(fetchDeploymentAndProject(deploymentId))
      }
    },
    onDeploymentTargetsClick: () => { dispatch(fetchDeploymentTargets()) },
    // updateProjectSettings: (project, newSettings) => { dispatch(updateProject(project, newSettings)) }, // dispatch(updateProject(project, { [propName] : newValue }))
    // thirdPartySync: (type) => { dispatch(thirdPartySync(projectId, type)) },
    // updateAllFeeds: (project) => { dispatch(fetchFeedsForProject(project)) },
    // newFeedSourceNamed: (name) => {
    //   dispatch(saveFeedSource({ projectId, name }))
    // },
    // feedSourcePropertyChanged: (feedSource, propName, newValue) => {
    //   dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    // },
    // deploymentsRequested: () => { dispatch(fetchProjectDeployments(projectId)) },
    // searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))},
    // deleteFeedSourceConfirmed: (feedSource) => {
    //   dispatch(deleteFeedSource(feedSource))
    // }
  }
}

const ActiveDeploymentViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeploymentViewer)

export default ActiveDeploymentViewer
