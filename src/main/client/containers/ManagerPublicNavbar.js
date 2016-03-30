import React from 'react'
import { connect } from 'react-redux'

import PublicNavbar from '../components/PublicNavbar'

import { login, logout, resetPassword } from '../actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    auth0: state.user.state,
    title: state.config.title,
    managerUrl: '#',
    editorUrl: state.config.editorUrl,
    userAdminUrl: state.config.editorUrl,
    username: state.user.profile ? state.user.profile.email : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginHandler: () => { dispatch(login()) },
    logoutHandler: () => { dispatch(logout()) },
    // openAccount: () => { dispatch(openAccount())},
    resetPasswordHandler: () => { dispatch(resetPassword()) }
  }
}

var ManagerPublicNavbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicNavbar)

export default ManagerPublicNavbar
