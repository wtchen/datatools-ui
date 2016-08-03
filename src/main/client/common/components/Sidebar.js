import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Navbar, Button, ButtonToolbar, Checkbox } from 'react-bootstrap'
import { Icon } from 'react-fa'

import SidebarPopover from './SidebarPopover'
import JobMonitor from './JobMonitor'

export default class Sidebar extends Component {

  static propTypes = {
    expanded: PropTypes.bool,
    jobMonitor: PropTypes.object,
    username: PropTypes.string,

    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPasswordHandler: PropTypes.func,
    setJobMonitorVisible: PropTypes.func,
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
    const messages = DT_CONFIG.messages.active.DatatoolsNavbar

    const navbarStyle = {
      width: this.props.expanded ? 150 : 50,
      height: '100%',
      position: 'fixed',
      borderRadius: 0
    }

    const closePopover = () => this.setState({visiblePopover: null})

    return <div>
      <Navbar
        inverse
        style={navbarStyle}
      >
        <div style={{ position: 'absolute', bottom: 10 }}>
          <SidebarNavItem ref='jobNav' expanded={this.props.expanded}
            icon='bell' label='Job Monitor'
            onClick={() => this.navSelected('job')} />
          <SidebarNavItem ref='userNav' expanded={this.props.expanded}
            icon='user' label='Account'
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
        visible={() => this.state.visiblePopover === 'job' }
        close={() => closePopover()}
      />

      {/* User Popover */}
      <SidebarPopover target={this.refs.userNav} title={this.props.username}
        visible={() => this.state.visiblePopover === 'user' }
        close={() => closePopover()}
      >
        <ButtonToolbar>
          <Button bsSize='small' bsStyle='info' onClick={() => {
            this.setState({ visiblePopover: null })
            this.props.resetPasswordHandler()
          }}>Change Password</Button>
          <Button bsSize='small' bsStyle='info' onClick={() => {
            this.setState({ visiblePopover: null })
            this.props.logoutHandler()
          }}>Logout</Button>
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

class SidebarNavItem extends Component {

  static propTypes = {
    expanded: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const containerStyle = {
      marginBottom: 20,
      cursor: 'pointer'
    }

    const iconContainerStyle = {
      width: 20,
      height: 20,
      textAlign: 'center',
      float: 'left'
    }

    const iconStyle = {
      color: '#ccc'
    }

    const labelStyle = {
      color: '#ccc',
      fontWeight: 'bold',
      marginLeft: 30
    }

    return (
      <div style={containerStyle} onClick={() => this.props.onClick()}>
        <div style={iconContainerStyle}>
          <Icon name={this.props.icon} size='lg' style={iconStyle} ref='icon'

          />
        </div>
        {this.props.expanded
          ? <div style={labelStyle}>{this.props.label}</div>
          : null
        }
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}
