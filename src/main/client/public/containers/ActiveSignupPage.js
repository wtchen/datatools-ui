import React from 'react'
import { connect } from 'react-redux'

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
      console.log('creating user', credentials)
      dispatch(createPublicUser(credentials))
      .then((user) => {
        console.log('logging in', user)
        dispatch(login(credentials, user))
      }).then((something) => {
        console.log(something)
        // TODO: fix this
        //dispatch(routerPush())
      })
    }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignupPage)

export default ActiveUserAccount
