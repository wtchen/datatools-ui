// @flow

import { connect } from 'react-redux'

import { fetchProjects, updateProject, createProject } from '../actions/projects'
import { setVisibilitySearchText } from '../actions/visibilityFilter'
import ProjectsList from '../components/ProjectsList'
import { getProjects } from '../selectors'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: getProjects(state),
    user: state.user,
    visibilitySearchText: state.projects.filter.searchText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      dispatch(setVisibilitySearchText(null))
      dispatch(fetchProjects())
    },
    createProject: (project) => dispatch(createProject(project)),
    projectNameChanged: (project, name) => dispatch(updateProject(project, {name})),
    searchTextChanged: (text) => dispatch(setVisibilitySearchText(text))
  }
}

const ActiveProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default ActiveProjectsList
