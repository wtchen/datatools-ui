import React from 'react'
import { connect } from 'react-redux'

import SignupPage from '../components/SignupPage'

import { setVisibilitySearchText } from '../actions/visibilityFilter'

import { fetchProjectsWithPublicFeeds } from '../actions/projects'
import { login, createPublicUser, fetchUser, userLoggedIn, checkExistingLogin } from '../actions/user'
import { routerPush } from '../actions/config'

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
      dispatch(createPublicUser(credentials))
      .then((user) => {
        console.log('logging in', user)
        dispatch(login(credentials, user))
      }).then((something) => {
        console.log(something)
        dispatch(routerPush())
      })
    }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupPage)

export default ActiveUserAccount
