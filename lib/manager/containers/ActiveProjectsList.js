// @flow

import {connect} from 'react-redux'

import {fetchProjects, updateProject} from '../actions/projects'
import {setVisibilitySearchText} from '../actions/visibilityFilter'
import ProjectsList from '../components/ProjectsList'
import {getProjects} from '../selectors'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps) => {
  return {
    projects: getProjects(state),
    user: state.user,
    visibilitySearchText: state.projects.filter.searchText
  }
}

const mapDispatchToProps = {
  fetchProjects,
  setVisibilitySearchText,
  updateProject
}

const ActiveProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default ActiveProjectsList
