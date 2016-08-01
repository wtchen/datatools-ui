import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import SignupPage from '../components/SignupPage'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import { fetchProjectsWithPublicFeeds } from '../../manager/actions/projects'
import { login, createPublicUser, fetchUser, userLoggedIn, checkExistingLogin } from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    visibilitySearchText: state.projects.filter.searchText,
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
      dispatch(createPublicUser(credentials))
      .then((user) => {
        dispatch(login(credentials, user))
        .then(() => {
          browserHistory.push('/project')
        })
      })
    }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupPage)

export default ActiveUserAccount
