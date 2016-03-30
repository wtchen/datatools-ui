import React from 'react'
import { connect } from 'react-redux'

import SignupPage from '../components/SignupPage'

import { setVisibilitySearchText } from '../actions/visibilityFilter'

import { fetchProjectsWithPublicFeeds } from '../actions/projects'
import { login, createUser, getUser, userLoggedIn, checkExistingLogin } from '../actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    visibilitySearchText: state.visibilityFilter.searchText,
    projects: state.projects.all,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  // const projectId = ownProps.routeParams.projectId
  return {
    onComponentMount: (initialProps) => {
      dispatch(fetchProjectsWithPublicFeeds())
    },
    loginHandler: () => { dispatch(login()) },
    signupHandler: (credentials) => {
      console.log('creating user', credentials)
      dispatch(createUser(credentials))
      .then((user) => {
        console.log('logging in', user)
        dispatch(login(credentials, user))
        // dispatch(checkExistingLogin())
      })
    }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupPage)

export default ActiveUserAccount
