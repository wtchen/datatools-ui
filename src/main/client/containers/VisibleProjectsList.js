import React from 'react'
import { connect } from 'react-redux'

import ProjectsList from '../components/ProjectsList'

import { fetchProjects, updateProject, createProject, saveProject } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.projects
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: () => { dispatch(fetchProjects()) },
    onNewProjectClick: () => { dispatch(createProject()) },
    newProjectNamed: (name) => {
      dispatch(saveProject({ name }))
    },
    projectNameChanged: (project, newName) => {
      dispatch(updateProject(project, { name : newName }))
    }
  }
}

const VisibleProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default VisibleProjectsList
