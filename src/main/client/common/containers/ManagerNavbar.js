import React from 'react'
import { connect } from 'react-redux'

import DatatoolsNavbar from '../components/DatatoolsNavbar'
import { login, logout, resetPassword } from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    title: DT_CONFIG.application.title,
    managerUrl: '/project',
    editorUrl: DT_CONFIG.modules.editor ? DT_CONFIG.modules.editor.url : null,
    userAdminUrl: DT_CONFIG.modules.user_admin ? DT_CONFIG.modules.user_admin.url : null,
    alertsUrl: DT_CONFIG.modules.alerts ? DT_CONFIG.modules.alerts.url : null,
    signConfigUrl: DT_CONFIG.modules.sign_config ? DT_CONFIG.modules.sign_config.url : null,
    username: state.user.profile ? state.user.profile.email : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginHandler: () => { dispatch(login()) },
    logoutHandler: () => { dispatch(logout()) },
    resetPasswordHandler: () => { dispatch(resetPassword()) }
  }
}

var ManagerNavbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(DatatoolsNavbar)

export default ManagerNavbar
