// @flow

import {connect} from 'react-redux'

import {updateProject} from '../actions/projects'
import {fetchProjectFeeds} from '../actions/feeds'
import {
  createDeployment,
  fetchProjectDeployments,
  saveDeployment,
  deleteDeployment,
  updateDeployment
} from '../actions/deployments'
import DeploymentsPanel from '../components/DeploymentsPanel'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  activeSubComponent: ?string,
  expanded: boolean,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({})

const mapDispatchToProps = {
  createDeployment,
  deleteDeployment,
  fetchProjectDeployments,
  fetchProjectFeeds,
  saveDeployment,
  updateDeployment,
  updateProject
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentsPanel)
