import {connect} from 'react-redux'

import Sidebar from '../components/Sidebar'
import {login, logout, resetPassword, revokeToken} from '../../manager/actions/user'
import {setActiveLanguage} from '../../manager/actions/languages'
import {removeRetiredJob} from '../../manager/actions/status'
import {setSidebarExpanded, setTutorialHidden} from '../../manager/actions/ui'

const mapStateToProps = (state, ownProps) => {
  return {
    expanded: state.ui.sidebarExpanded,
    hideTutorial: state.ui.hideTutorial,
    user: state.user,
    projects: state.projects ? state.projects : null,
    languages: state.languages ? state.languages : ['English', 'Español', 'Français'],
    jobMonitor: state.status.jobMonitor
  }
}

const mapDispatchToProps = {
  login,
  logout,
  removeRetiredJob,
  resetPassword,
  revokeToken,
  setActiveLanguage,
  setSidebarExpanded,
  setTutorialHidden
}

const ActiveSidebar = connect(mapStateToProps, mapDispatchToProps)(Sidebar)

export default ActiveSidebar
