import { connect } from 'react-redux'

import DatatoolsNavbar from '../components/DatatoolsNavbar'
import { login, logout, resetPassword } from '../../manager/actions/user'
import { setActiveProject } from '../../manager/actions/projects'
import { setActiveLanguage } from '../../manager/actions/languages'
import { setJobMonitorVisible } from '../../manager/actions/status'
import { getConfigProperty } from '../util/config'

const mapStateToProps = (state, ownProps) => {
  return {
    title: getConfigProperty('application.title'),
    managerUrl: '/project',
    editorUrl: getConfigProperty('modules.editor') ? getConfigProperty('modules.editor.url') : null,
    userAdminUrl: getConfigProperty('modules.user_admin') ? getConfigProperty('modules.user_admin.url') : null,
    alertsUrl: getConfigProperty('modules.alerts') ? getConfigProperty('modules.alerts.url') : null,
    signConfigUrl: getConfigProperty('modules.sign_config') ? getConfigProperty('modules.sign_config.url') : null,
    docsUrl: getConfigProperty('application.docs_url') ? getConfigProperty('application.docs_url') : null,
    username: state.user.profile ? state.user.profile.email : null,
    sidebarExpanded: state.ui.sidebarExpanded,
    userIsAdmin: state.user.profile && state.user.permissions.isApplicationAdmin(),
    projects: state.projects ? state.projects : null,
    languages: state.languages ? state.languages : ['English', 'Español', 'Français'],
    jobMonitor: state.status.jobMonitor
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginHandler: () => { dispatch(login()) },
    logoutHandler: () => { dispatch(logout()) },
    resetPassword: () => { dispatch(resetPassword()) },
    setActiveProject: (project) => { dispatch(setActiveProject(project)) },
    setActiveLanguage: (language) => { dispatch(setActiveLanguage(language)) },
    setJobMonitorVisible: (visible) => { dispatch(setJobMonitorVisible(visible)) }
  }
}

var ManagerNavbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(DatatoolsNavbar)

export default ManagerNavbar
