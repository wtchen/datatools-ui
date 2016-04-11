import { DatatoolsNavbar } from 'datatools-common'
import React  from 'react'
import { connect } from 'react-redux'

import { login, logout, resetPassword } from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    title: DT_CONFIG.application.title,
    managerUrl: '#',
    editorUrl: DT_CONFIG.modules.editor.url,
    //userAdminUrl: state.config.userAdminUrl,
    alertsUrl: DT_CONFIG.modules.alerts.url,
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
