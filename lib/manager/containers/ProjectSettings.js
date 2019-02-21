// @flow

import {connect} from 'react-redux'

import {deleteProject, updateProject} from '../actions/projects'
import ProjectSettings from '../components/ProjectSettings'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  activeSubComponent: ?string,
  project: Project,
  projectEditDisabled: boolean
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {}
}

const mapDispatchToProps = {
  deleteProject,
  updateProject
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSettings)
