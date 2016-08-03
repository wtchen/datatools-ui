import React from 'react'
import { connect } from 'react-redux'

import DatatoolsNavbar from '../../common/components/DatatoolsNavbar'
import { login, logout, resetPassword } from '../../manager/actions/user'
import { getConfigProperty } from '../../common/util/config'

const mapStateToProps = (state, ownProps) => {
  return {
    title: getConfigProperty('application.title'),
    managerUrl: '/project',
    editorUrl: null,
    userAdminUrl: null,
    alertsUrl: null,
    signConfigUrl: null,
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
)(DatatoolsNavbar)

export default ManagerPublicNavbar
