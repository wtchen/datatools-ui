import Pure from '@conveyal/woonerf/components/pure'
import React, {PropTypes} from 'react'
import {Navbar, Checkbox} from 'react-bootstrap'
import {Link} from 'react-router'

import SidebarNavItem from './SidebarNavItem'
import SidebarPopover from './SidebarPopover'
import JobMonitor from './JobMonitor'
import UserButtons from './UserButtons'

export default class Sidebar extends Pure {
  static propTypes = {
    expanded: PropTypes.bool,
    jobMonitor: PropTypes.object,
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    resetPassword: PropTypes.func,
    removeRetiredJob: PropTypes.func,
    setSidebarExpanded: PropTypes.func
  }

  state = {
    visiblePopover: null
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.jobMonitor.timer && nextProps.jobMonitor.timer) {
      this.setState({ visiblePopover: 'job' })
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

  _closePopover = () => this.setState({visiblePopover: null})

  _select = (key) => this.setState({visiblePopover: (key === this.state.visiblePopover) ? null : key})
  _selectHelp = () => this._select('help')
  _selectJob = () => this._select('job')
  _selectUser = () => this._select('user')

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
              finished={this.props.jobMonitor.jobs.length === 0 && this.props.jobMonitor.retired.length > 0}
              label='Server jobs'
              onClick={this._selectJob} />
            <SidebarNavItem
              ref='userNav'
              expanded={expanded}
              icon='user'
              label='Account'
              image={userPicture}
              onClick={this._selectUser} />
            <SidebarNavItem
              ref='settingsNav'
              expanded={expanded}
              icon='gear'
              label='Settings'
              onClick={this._selectHelp} />
          </div>
        </Navbar>

        {/* Job Monitor Popover */}
        <JobMonitor
          jobMonitor={this.props.jobMonitor}
          target={this.refs.jobNav}
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === 'job'}
          close={this._closePopover}
          removeRetiredJob={this.props.removeRetiredJob} />

        {/* User Popover */}
        <SidebarPopover
          target={this.refs.userNav}
          title={user.profile ? user.profile.email : null}
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === 'user'}
          close={this._closePopover}
        >
          <UserButtons user={user} logoutHandler={this._clickLogOut} />
        </SidebarPopover>

        {/* Settings Popover */}
        <SidebarPopover
          target={this.refs.settingsNav}
          title='Settings'
          expanded={this.props.expanded}
          visible={this.state.visiblePopover === 'help'}
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

class Brand extends Pure {
  static propTypes = {
    expanded: PropTypes.bool.isRequired
  }

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
