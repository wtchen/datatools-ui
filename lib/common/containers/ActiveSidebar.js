// @flow

import {connect} from 'react-redux'

import Sidebar from '../components/Sidebar'
import {logout, revokeToken} from '../../manager/actions/user'
import {
  fetchAppInfo,
  removeRetiredJob,
  startJobMonitor,
  setJobMonitorVisible
} from '../../manager/actions/status'
import {setSidebarExpanded, setTutorialHidden} from '../../manager/actions/ui'

import type {AppState} from '../../types/reducers'

export type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    appInfo: state.status.appInfo,
    expanded: state.ui.sidebarExpanded,
    hideTutorial: state.ui.hideTutorial,
    jobMonitor: state.status.jobMonitor,
    user: state.user
  }
}

const mapDispatchToProps = {
  fetchAppInfo,
  logout,
  removeRetiredJob,
  revokeToken,
  setJobMonitorVisible,
  setSidebarExpanded,
  setTutorialHidden,
  startJobMonitor
}

const ActiveSidebar = connect(mapStateToProps, mapDispatchToProps)(Sidebar)

export default ActiveSidebar
