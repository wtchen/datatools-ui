import React from 'react'
import { connect } from 'react-redux'

import ProjectsList from '../components/ProjectsList'

const mapStateToProps = (state, ownProps) => {
  return {
    foo: 'bar',
    projects: state.projects
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onNewProjectClick: () => { console.log('new project') }
  }
}

const VisibleProjectsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectsList)

export default VisibleProjectsList
