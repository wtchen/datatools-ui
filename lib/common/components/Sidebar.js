// @flow

import * as React from 'react'
import {Navbar, Checkbox} from 'react-bootstrap'
import {Link} from 'react-router'

import {removeRetiredJob, startJobMonitor, setJobMonitorVisible} from '../../manager/actions/status'
import {setSidebarExpanded, setTutorialHidden} from '../../manager/actions/ui'
import {logout, revokeToken} from '../../manager/actions/user'
import JobMonitor from './JobMonitor'
import SidebarNavItem from './SidebarNavItem'
import SidebarPopover from './SidebarPopover'
import UserButtons from './UserButtons'

import type {JobStatusState, ManagerUserState} from '../../types/reducers'

export const POPOVER = Object.freeze({
  JOB: 'job',
  HELP: 'help',
  USER: 'user'
})

type Props = {
  children: React.Node,
  expanded: boolean,
  hideTutorial: boolean,
  jobMonitor: JobStatusState,
  logout: typeof logout,
  removeRetiredJob: typeof removeRetiredJob,
  revokeToken: typeof revokeToken,
  setJobMonitorVisible: typeof setJobMonitorVisible,
  setSidebarExpanded: typeof setSidebarExpanded,
  setTutorialHidden: typeof setTutorialHidden,
  startJobMonitor: typeof startJobMonitor,
  user: ManagerUserState,
  userPicture: ?string
}

type State = {visiblePopover: ?string}

export default class Sidebar extends React.Component<Props, State> {
  state = {
    visiblePopover: null
  }

  componentWillMount () {
    // Check for active jobs on mount (so that if a user reloads the page, they
    // will still know the status of jobs that had been running).
    this.props.startJobMonitor(false)
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!this.props.jobMonitor.visible && nextProps.jobMonitor.visible) {
      this.setState({ visiblePopover: POPOVER.JOB })
    }
  }

  _clickLogOut = () => {
    this.setState({visiblePopover: null})
    this.props.logout()
  }

  _clickRevokeToken = () => {
    this.setState({visiblePopover: null})
    this.props.revokeToken()
  }

  _closeJobPopover = () => {
    this.props.setJobMonitorVisible(false)
    this._closePopover()
  }

  _closePopover = () => this.setState({visiblePopover: null})

  _select = (key: $Values<typeof POPOVER>) =>
    this.setState({visiblePopover: (key === this.state.visiblePopover) ? null : key})

  _toggleLabels = () => this.props.setSidebarExpanded(!this.props.expanded)

  _toggleTutorial = () => this.props.setTutorialHidden(!this.props.hideTutorial)

  render () {
    const {children, expanded, user, userPicture} = this.props
    const navbarStyle = {
      width: expanded ? 130 : 50,
      minHeight: '500px'
    }
    const hasActiveJobs = this.props.jobMonitor.jobs.length > 0
    return (
      <div className='Sidebar'>
        <Navbar
          inverse
          style={navbarStyle}>
          <Brand expanded={expanded === true} />
          <div className='TopNav'>
            {children}
          </div>
          <div className='BottomNav'>
            <SidebarNavItem
              ref='jobNav'
              expanded={expanded}
              icon={hasActiveJobs ? 'refresh' : 'bell'}
              loading={hasActiveJobs}
              keyName={POPOVER.JOB}
              finished={this.props.jobMonitor.jobs.length === 0 && this.props.jobMonitor.retired.length > 0}
              label='Server jobs'
              onClick={this._select} />
            <SidebarNavItem
              ref='userNav'
              expanded={expanded}
              keyName={POPOVER.USER}
              icon='user'
              label='Account'
              image={userPicture}
              onClick={this._select} />
            <SidebarNavItem
              ref='settingsNav'
              keyName={POPOVER.HELP}
              expanded={expanded}
              icon='gear'
              label='Settings'
              onClick={this._select} />
          </div>
        </Navbar>

        {/* Job Monitor Popover */}
        <JobMonitor
          jobMonitor={this.props.jobMonitor}
          target={this.refs.jobNav}
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === POPOVER.JOB}
          close={this._closeJobPopover}
          removeRetiredJob={this.props.removeRetiredJob} />

        {/* User Popover */}
        <SidebarPopover
          target={this.refs.userNav}
          title={user.profile ? user.profile.email : null}
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === POPOVER.USER}
          close={this._closePopover}>
          <UserButtons user={user} logoutHandler={this._clickLogOut} />
        </SidebarPopover>

        {/* Settings Popover */}
        <SidebarPopover
          target={this.refs.settingsNav}
          title='Settings'
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === POPOVER.HELP}
          close={this._closePopover}>
          <div>
            <Checkbox
              ref='showLabelsCheckbox'
              checked={this.props.expanded}
              onChange={this._toggleLabels}>
              Show Sidebar Labels
            </Checkbox>
            <Checkbox
              ref='showTutorialCheckbox'
              checked={this.props.hideTutorial}
              onChange={this._toggleTutorial}>
              Hide editor tutorial
            </Checkbox>
          </div>
        </SidebarPopover>
      </div>
    )
  }
}

class Brand extends React.Component<{expanded: boolean}> {
  render () {
    const {expanded} = this.props
    return (
      <Link to='/home'>
        <div
          className='LogoContainer'>
          <div className='Logo' />
          {expanded && <div className='LogoLabel'>GTFS Data<br />Manager</div>}
          <div className='clearfix' />
        </div>
      </Link>
    )
  }
}
