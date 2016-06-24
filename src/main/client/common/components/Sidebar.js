import React, { Component, PropTypes } from 'react'
import { Navbar, Nav, NavItem, Button, ButtonToolbar } from 'react-bootstrap'
import { Icon } from 'react-fa'

import SidebarPopover from './SidebarPopover'
import JobMonitor from './JobMonitor'

export default class Sidebar extends Component {

  static propTypes = {
    username: PropTypes.string,
    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPasswordHandler: PropTypes.func,
    jobMonitor: PropTypes.object,
    setJobMonitorVisible: PropTypes.func
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

  render () {
    const messages = DT_CONFIG.messages.active.DatatoolsNavbar

    const iconStyle = {
      color: '#ccc'
    }

    const navbarStyle = {
      width: 50,
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

        <Nav stacked bsStyle='pills' style={{ marginLeft: -25 }}>
          <NavItem className='text-center'>
            <Icon name='smile-o' size='3x' style={iconStyle} />
          </NavItem>
        </Nav>

        <Nav stacked bsStyle='pills' style={{ position: 'absolute', bottom: 20, marginLeft: -16 }}
          onSelect={(key) => {
            if (key === this.state.visiblePopover) closePopover()
            else this.setState({visiblePopover: key})
          }}
        >
          <NavItem className='text-center' eventKey='job'>
            <Icon name='bell' size='lg' style={iconStyle} ref='bellIcon'/>
          </NavItem>

          <NavItem className='text-center' eventKey='user'>
            <Icon name='user' size='lg' style={iconStyle} ref='userIcon' />
          </NavItem>

          <NavItem className='text-center' eventKey='language'>
            <Icon name='globe' size='lg' style={iconStyle} ref='languageIcon' />
          </NavItem>

          <NavItem className='text-center' eventKey='help'>
            <Icon name='question-circle' size='lg' style={iconStyle} ref='helpIcon' />
          </NavItem>
        </Nav>
      </Navbar>

      <JobMonitor
        jobMonitor={this.props.jobMonitor}
        target={this.refs.bellIcon}
        visible={() => this.state.visiblePopover === 'job' }
        close={() => closePopover()}
      />

      <SidebarPopover target={this.refs.userIcon} title={this.props.username}
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

      <SidebarPopover target={this.refs.languageIcon} title='Language'
        visible={() => this.state.visiblePopover === 'language' }
        close={() => closePopover()}
      >
      </SidebarPopover>

      <SidebarPopover target={this.refs.helpIcon} title='Help'
        visible={() => this.state.visiblePopover === 'help' }
        close={() => closePopover()}
      >
        <div>Change Password</div>
        <div>Logout</div>
      </SidebarPopover>

    </div>
  }
}
