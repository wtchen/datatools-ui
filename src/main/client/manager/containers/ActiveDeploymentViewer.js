import React from 'react'
import { connect } from 'react-redux'

import DeploymentViewer from '../components/DeploymentViewer'
import { fetchDeployment,
  fetchDeploymentAndProject,
  fetchDeploymentTargets,
  deployToTarget,
  updateDeployment,
  fetchDeploymentStatus
} from '../actions/deployments'

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
    deployToTargetClicked: (deployment, target) => { dispatch(deployToTarget(deployment, target)) },
    // updateProjectSettings: (project, newSettings) => { dispatch(updateProject(project, newSettings)) }, // dispatch(updateProject(project, { [propName] : newValue }))
    // thirdPartySync: (type) => { dispatch(thirdPartySync(projectId, type)) },
    // updateAllFeeds: (project) => { dispatch(fetchFeedsForProject(project)) },
    // feedSourcePropertyChanged: (feedSource, propName, newValue) => {
    //   dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    // },
    // deploymentsRequested: () => { dispatch(fetchProjectDeployments(projectId)) },
    // searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))},
    getDeploymentStatus: (deployment, target) => {dispatch(fetchDeploymentStatus(deployment, target))},
    updateVersionForFeedSource: (deployment, feedSource, feedVersion) => {
      let feedVersions = [...deployment.feedVersions]
      let index = feedVersions.findIndex(v => v.feedSource.id === feedSource.id)
      feedVersions.splice(index, 1)
      feedVersions.push(feedVersion)
      dispatch(updateDeployment(deployment, {feedVersions}))
    },
    addFeedVersion: (deployment, feedVersion) => {
      let feedVersions = [...deployment.feedVersions, feedVersion]
      dispatch(updateDeployment(deployment, {feedVersions}))
    },
    deleteFeedVersion: (deployment, feedVersion) => {
      let feedVersions = deployment.feedVersions
      let index = feedVersions.findIndex(v => v.id === feedVersion.id)
      feedVersions.splice(index, 1)
      dispatch(updateDeployment(deployment, {feedVersions}))
    },
  }
}

const ActiveDeploymentViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeploymentViewer)

export default ActiveDeploymentViewer
