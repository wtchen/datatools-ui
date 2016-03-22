import React from 'react'
import { connect } from 'react-redux'

import ProjectsList from '../components/ProjectsList'

import { setVisibilitySearchText } from '../actions/visibilityFilter'
import { fetchProjects, updateProject, createProject, saveProject } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.projects.all.filter((project) => {
      if(project.isCreating) return true // projects actively being created are always visible
      return project.name.toLowerCase().indexOf((state.visibilityFilter.searchText || '').toLowerCase()) !== -1
    })
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: () => {
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

const VisibleProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default VisibleProjectsList
