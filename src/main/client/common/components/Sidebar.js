import React, { Component, PropTypes } from 'react'
import { Navbar, Button, ButtonToolbar, Checkbox } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import { Link } from 'react-router'
import Icon from 'react-fa'

import SidebarNavItem from './SidebarNavItem'
import SidebarPopover from './SidebarPopover'
import JobMonitor from './JobMonitor'
import { getComponentMessages, getMessage, getConfigProperty } from '../util/config'

import icon from '../../assets/application_icon.png'
import longIcon from '../../assets/application_logo.png'

export default class Sidebar extends Component {

  static propTypes = {
    expanded: PropTypes.bool,
    jobMonitor: PropTypes.object,
    username: PropTypes.string,
    userPicture: PropTypes.string,

    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPassword: PropTypes.func,
    setJobMonitorVisible: PropTypes.func,
    removeRetiredJob: PropTypes.func,
    setSidebarExpanded: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      visiblePopover: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.jobMonitor.timer && nextProps.jobMonitor.timer) {
      this.setState({ visiblePopover: 'job' })
    }
  }

  navSelected (key) {
    this.setState({visiblePopover: (key === this.state.visiblePopover) ? null : key})
  }

  render () {
    const messages = getComponentMessages('DatatoolsNavbar')

    const navbarStyle = {
      width: this.props.expanded ? 130 : 50,
      height: '100%',
      position: 'fixed',
      borderRadius: 0,
    }

    const logoContainerStyle = {
      position: 'fixed',
      top: 10,
      left: 10,
      // left: 0,
      cursor: 'pointer'
    }
    const LOGO_SIZE = 30
    const logoIconStyle = {
      float: 'left',
      // background: '#bbb',
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: '120%',
    }

    const logoLabelStyle = {
      marginLeft: 40,
      marginTop: 6,
      lineHeight: '95%',
      color: '#bbb',
      fontSize: 13,
      fontWeight: 'bold'
    }
    const expandedIcon = <div style={logoIconStyle}><img height={50} src={getConfigProperty('application.logo') ? getConfigProperty('application.logo') : longIcon}/></div>
    const closePopover = () => this.setState({visiblePopover: null})
    const hasActiveJobs = this.props.jobMonitor.jobs.length > 0
    const brand = (
      <Link to='/home'>
        <div
          style={logoContainerStyle}
        >
          <div style={logoIconStyle}><img height={LOGO_SIZE} width={LOGO_SIZE} src={icon}/></div>
          {this.props.expanded
            ? <div style={logoLabelStyle}>GTFS Data<br/>Manager</div> // TODO: replace with long icon
            : null
          }
          <div style={{ clear: 'both' }} />
        </div>
      </Link>
    )
    return <div>
      <Navbar
        inverse
        style={navbarStyle}
      >
        {brand}

        {/* Top nav */}
        <div style={{ position: 'absolute', top: 60 }}>
          {this.props.children}
        </div>

        {/* Bottom nav */}
        <div
          style={{ position: 'absolute', bottom: 10 }}
        >
          <SidebarNavItem ref='jobNav' expanded={this.props.expanded}
            icon={hasActiveJobs ? 'refresh' : 'bell'} label='Job Monitor'
            // active={this.props.jobMonitor.jobs.length > 0}
            loading={hasActiveJobs}
            finished={this.props.jobMonitor.jobs.length === 0 && this.props.jobMonitor.retired.length > 0}
            onClick={() => this.navSelected('job')} />
          <SidebarNavItem ref='userNav' expanded={this.props.expanded}
            icon='user' label='Account' image={this.props.userPicture}
            onClick={() => this.navSelected('user')} />
          <SidebarNavItem ref='settingsNav' expanded={this.props.expanded}
            icon='gear' label='Settings'
            onClick={() => this.navSelected('help')} />
        </div>
      </Navbar>

      {/* Job Monitor Popover */}
      <JobMonitor
        jobMonitor={this.props.jobMonitor}
        target={this.refs.jobNav}
        expanded={this.props.expanded}
        visible={() => this.state.visiblePopover === 'job' }
        close={() => closePopover()}
        removeRetiredJob={this.props.removeRetiredJob}
      />

      {/* User Popover */}
      <SidebarPopover
        target={this.refs.userNav}
        title={this.props.username}
        expanded={this.props.expanded}
        visible={() => this.state.visiblePopover === 'user' }
        close={() => closePopover()}
      >
        <ButtonToolbar>
          <Button bsSize='small' bsStyle='info' onClick={() => {
            this.setState({ visiblePopover: null })
            this.props.resetPassword()
          }}>Change Password</Button>
          <Button bsSize='small' bsStyle='info' onClick={() => {
            this.setState({ visiblePopover: null })
            this.props.logoutHandler()
          }}><Icon name='sign-out'/> Log out</Button>
        </ButtonToolbar>
      </SidebarPopover>

      {/* Settings Popover */}
      <SidebarPopover target={this.refs.settingsNav} title='Settings'
        expanded={this.props.expanded}
        visible={() => this.state.visiblePopover === 'help' }
        close={() => closePopover()}
      >
        <div>
          <Checkbox
            ref='showLabelsCheckbox'
            checked={this.props.expanded}
            onChange={() => { this.props.setSidebarExpanded(!this.props.expanded) }}
          >
            Show Sidebar Labels
          </Checkbox>
          <Checkbox
            ref='showTutorialCheckbox'
            checked={this.props.hideTutorial}
            onChange={() => { this.props.setTutorialHidden(!this.props.hideTutorial) }}
          >
            Hide editor tutorial
          </Checkbox>
        </div>
      </SidebarPopover>

    </div>
  }
}
