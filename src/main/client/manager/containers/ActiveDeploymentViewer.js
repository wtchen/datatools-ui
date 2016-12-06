import { connect } from 'react-redux'

import DeploymentViewer from '../components/DeploymentViewer'
import { fetchDeploymentAndProject,
  deployToTarget,
  updateDeployment,
  fetchDeploymentStatus,
  downloadDeployment
} from '../actions/deployments'

import { fetchProjectFeeds } from '../actions/feeds'

const mapStateToProps = (state, ownProps) => {
  let user = state.user
  return {
    user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const deploymentId = ownProps.deployment && ownProps.deployment.id
  return {
    onComponentMount: (initialProps) => {
      if (initialProps.user.profile === null) {
        return
      }
      if (!initialProps.deployment) {
        dispatch(fetchDeploymentAndProject(deploymentId))
        .then((deployment) => {
          console.log(deployment)
          dispatch(fetchProjectFeeds(deployment.project.id))
        })
      }
    },
    deployToTargetClicked: (deployment, target) => { dispatch(deployToTarget(deployment, target)) },
    downloadDeployment: (deployment) => { dispatch(downloadDeployment(deployment)) },
    // updateProjectSettings: (project, newSettings) => { dispatch(updateProject(project, newSettings)) }, // dispatch(updateProject(project, { [propName] : newValue }))
    // thirdPartySync: (type) => { dispatch(thirdPartySync(projectId, type)) },
    // updateAllFeeds: (project) => { dispatch(fetchFeedsForProject(project)) },
    // feedSourcePropertyChanged: (feedSource, propName, newValue) => {
    //   dispatch(updateFeedSource(feedSource, { [propName] : newValue }))
    // },
    // deploymentsRequested: () => { dispatch(fetchProjectDeployments(projectId)) },
    // searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))},
    getDeploymentStatus: (deployment, target) => { dispatch(fetchDeploymentStatus(deployment, target)) },
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
    }
  }
}

const ActiveDeploymentViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeploymentViewer)

export default ActiveDeploymentViewer
