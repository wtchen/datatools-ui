// @flow

import {connect} from 'react-redux'

import {
  createDeployment,
  deleteDeployment,
  saveDeployment,
  updateDeployment
} from '../actions/deployments'
import DeploymentsPanel from '../components/DeploymentsPanel'

import type {Deployment, Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  activeSubComponent: ?string,
  deployments: Array<Deployment>,
  expanded: boolean,
  fetchDeployments: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {}
}

const mapDispatchToProps = {
  createDeployment,
  deleteDeployment,
  saveDeployment,
  updateDeployment
}

export default connect(mapStateToProps, mapDispatchToProps)(DeploymentsPanel)
