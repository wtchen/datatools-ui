import React from 'react'
import { connect } from 'react-redux'

import UserAdmin from '../components/admin/UserAdmin'

import { setVisibilitySearchText } from '../actions/visibilityFilter'

import { fetchProjectsWithPublicFeeds } from '../actions/projects'
import { updateUser } from '../actions/user'
import { fetchUsers, createUser } from '../actions/admin'
import { fetchProjects } from '../actions/projects'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.projects.all,
    user: state.user,
    users: state.admin.users
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.users)
        dispatch(fetchUsers())
      if (!initialProps.projects)
        dispatch(fetchProjects())
    },
    updateUser: (user, permissions) => { dispatch(updateUser(user, permissions)) },
    createUser: (credentials) => { dispatch(createUser(credentials)) }
  }
}

const ActiveUserAdmin = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAdmin)

export default ActiveUserAdmin
