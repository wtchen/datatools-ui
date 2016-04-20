import React from 'react'
import { connect } from 'react-redux'

import UserAccount from '../components/UserAccount'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import { fetchProjectsWithPublicFeeds } from '../../manager/actions/projects'
import { updateUser, fetchUser } from '../../manager/actions/user'

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
      // dispatch(fetchProjectsWithPublicFeeds())
    },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text)) },
    updateUser: (user, permissions) => { dispatch(updateUser(user, permissions)) },
    fetchUser: (user, permissions) => { dispatch(fetchUser(user)) }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default ActiveUserAccount
