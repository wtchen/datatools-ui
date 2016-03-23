import React from 'react'
import { connect } from 'react-redux'

import ProjectsList from '../components/ProjectsList'

import { setVisibilitySearchText } from '../actions/visibilityFilter'
import { fetchProjects, updateProject, createProject, saveProject } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.projects.all,
    visibilitySearchText: state.visibilityFilter.searchText
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      dispatch(setVisibilitySearchText(null))
      dispatch(fetchProjects())
    },
    onNewProjectClick: () => { dispatch(createProject()) },
    newProjectNamed: (name) => {
      dispatch(saveProject({ name }))
    },
    projectNameChanged: (project, newName) => {
      dispatch(updateProject(project, { name : newName }))
    },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text))}
  }
}

const ActiveProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default ActiveProjectsList
