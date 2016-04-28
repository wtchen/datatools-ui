import React from 'react'
import { connect } from 'react-redux'

import UserAdmin from '../components/UserAdmin'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'

import { updateUserData } from '../../manager/actions/user'
import { fetchUsers, createUser } from '../actions/admin'
import { fetchProjects } from '../../manager/actions/projects'
import { fetchProjectFeeds } from '../../manager/actions/feeds'

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
      if (!initialProps.projects) {
        dispatch(fetchProjects())
      }
    },
    fetchProjectFeeds: (project) => { dispatch(fetchProjectFeeds(project)) },
    saveUser: (user, permissions) => {
      dispatch(updateUserData(user, permissions))
      .then(() => {
        dispatch(fetchUsers())
      })
    },
    // setUserPermission: (user, permissions) => { dispatch(setUserPermission(user, permissions)) },
    createUser: (credentials) => { dispatch(createUser(credentials)) }
  }
}

const ActiveUserAdmin = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAdmin)

export default ActiveUserAdmin
