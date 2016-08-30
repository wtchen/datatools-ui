import React, { Component, PropTypes } from 'react'
import { Navbar, Button, ButtonToolbar, Checkbox } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import { Link } from 'react-router'
import Icon from 'react-fa'

import SidebarNavItem from './SidebarNavItem'
import SidebarPopover from './SidebarPopover'
import JobMonitor from './JobMonitor'
import { getComponentMessages, getMessage } from '../util/config'

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
      width: this.props.expanded ? 150 : 50,
      height: '100%',
      position: 'fixed',
      borderRadius: 0
    }

    const logoContainerStyle = {
      position: 'fixed',
      top: 10,
      left: 10,
      cursor: 'pointer'
    }

    const logoIconStyle = {
      float: 'left',
      background: '#bbb',
      width: 30,
      height: 30,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: '120%',
    }

    const logoLabelStyle = {
      marginLeft: 40,
      lineHeight: '95%',
      color: '#bbb',
      fontSize: 16
    }

    const closePopover = () => this.setState({visiblePopover: null})

    return <div>
      <Navbar
        inverse
        style={navbarStyle}
      >
        <div style={logoContainerStyle}
          onClick={() => { browserHistory.push('/home') }}
        >
          <div style={logoIconStyle}>G</div>
          {this.props.expanded
            ? <div style={logoLabelStyle}>GTFS Data<br/>Manager</div>
            : null
          }
          <div style={{ clear: 'both' }} />
        </div>

        <div style={{ position: 'absolute', top: 60 }}>
          {this.props.children}
        </div>

        <div style={{ position: 'absolute', bottom: 10 }}>
          <SidebarNavItem ref='jobNav' expanded={this.props.expanded}
            icon='bell' label='Job Monitor'
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
      <SidebarPopover target={this.refs.userNav} title={this.props.username}
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
          <Checkbox ref='showLabelsCheckbox' checked={this.props.expanded}
            onClick={() => { this.props.setSidebarExpanded(!this.props.expanded) }}
          >
            Show Sidebar Labels
          </Checkbox>

        </div>
      </SidebarPopover>

    </div>
  }
}
