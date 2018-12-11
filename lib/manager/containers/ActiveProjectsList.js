// @flow

import {connect} from 'react-redux'

import {fetchProjects, updateProject, createProject, saveProject} from '../actions/projects'
import {setVisibilitySearchText} from '../actions/visibilityFilter'
import ProjectsList from '../components/ProjectsList'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    projects: state.projects.all
      ? state.projects.all.filter(
        p => p.isCreating ||
          (state.user.permissions && state.user.permissions.isApplicationAdmin()) ||
          (state.user.permissions && state.user.permissions.hasProject(p.id, p.organizationId))
      )
      : [],
    visibilitySearchText: state.projects.filter.searchText,
    user: state.user
  }
}

const mapDispatchToProps = {
  createProject,
  fetchProjects,
  saveProject,
  setVisibilitySearchText,
  updateProject
}

const ActiveProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default ActiveProjectsList
