import React from 'react'
import { connect } from 'react-redux'

import UserAdmin from '../components/UserAdmin'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'

import {
  fetchUsers,
  createUser,
  deleteUser,
  setUserPage,
  setUserQueryString
} from '../actions/admin'

import { updateUserData } from '../../manager/actions/user'
import { fetchProjects } from '../../manager/actions/projects'
import { fetchProjectFeeds } from '../../manager/actions/feeds'

const mapStateToProps = (state, ownProps) => {
  return {
    projects: state.projects.all,
    user: state.user,
    admin: state.admin
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.users)
        dispatch(fetchUsers())

      // always load projects to prevent interference with public feeds viewer loading of projects
      dispatch(fetchProjects())
    },
    fetchProjectFeeds: (project) => { dispatch(fetchProjectFeeds(project)) },
    saveUser: (user, permissions) => {
      dispatch(updateUserData(user, permissions))
      .then(() => {
        dispatch(fetchUsers())
      })
    },
    deleteUser: (user) => {
      dispatch(deleteUser(user))
      .then(() => {
        dispatch(fetchUsers())
      })
    },
    // setUserPermission: (user, permissions) => { dispatch(setUserPermission(user, permissions)) },
    createUser: (credentials) => { dispatch(createUser(credentials)) },
    setPage: (page) => {
      dispatch(setUserPage(page))
      dispatch(fetchUsers())
    },
    userSearch: (queryString) => {
      dispatch(setUserPage(0))
      dispatch(setUserQueryString(queryString))
      dispatch(fetchUsers())
    }
  }
}

const ActiveUserAdmin = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAdmin)

export default ActiveUserAdmin
