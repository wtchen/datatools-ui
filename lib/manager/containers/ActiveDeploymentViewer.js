// @flow

import {connect} from 'react-redux'

import {
  addFeedVersion,
  deleteFeedVersion,
  deployToTarget,
  downloadDeployment,
  refreshDeploymentData,
  updateDeployment,
  updateVersionForFeedSource
} from '../actions/deployments'
import DeploymentViewer from '../components/DeploymentViewer'

import type {Deployment, Feed, Project} from '../../types'
import type {AppState} from '../../types/reducers'

type Props = {
  deployment: Deployment,
  deployments: Array<Deployment>,
  feedSources: Array<Feed>,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const user = state.user
  return {
    user
  }
}

const mapDispatchToProps = {
  addFeedVersion,
  deleteFeedVersion,
  deployToTarget,
  downloadDeployment,
  refreshDeploymentData,
  updateDeployment,
  updateVersionForFeedSource
}

const ActiveDeploymentViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DeploymentViewer)

export default ActiveDeploymentViewer
