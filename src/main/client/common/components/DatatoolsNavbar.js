import React, {Component, PropTypes} from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon, OverlayTrigger, Popover, ProgressBar, Button, Badge } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { browserHistory, Link } from 'react-router'
import { Icon } from 'react-fa'

import Breadcrumbs from './Breadcrumbs'
import { isModuleEnabled, getComponentMessages, getMessage, getConfigProperty } from '../util/config'
import JobMonitor from './JobMonitor'

export default class DatatoolsNavbar extends Component {

  static propTypes = {
    title: PropTypes.string,
    username: PropTypes.string,
    managerUrl: PropTypes.string,
    editorUrl: PropTypes.string,
    userAdminUrl: PropTypes.string,
    alertsUrl: PropTypes.string,
    signConfigUrl: PropTypes.string,
    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPassword: PropTypes.func,
    jobMonitor: PropTypes.object,
    setJobMonitorVisible: PropTypes.func
  };

  render () {
    var userControl
    const messages = getComponentMessages('DatatoolsNavbar')

    if (!this.props.username) {
      userControl = (<NavItem onClick={this.props.loginHandler} href='#'>{getMessage(messages, 'login')}</NavItem>)
    } else {
      userControl = (
        <NavDropdown title={
          <span><Glyphicon glyph='user' /> {this.props.username}</span>
        } id='basic-nav-dropdown'>
        <MenuItem onClick={() => browserHistory.push('/account')}>{getMessage(messages, 'account')}</MenuItem>
          <MenuItem onClick={this.props.resetPassword}>{getMessage(messages, 'resetPassword')}</MenuItem>
          <MenuItem onClick={this.props.logoutHandler}>{getMessage(messages, 'logout')}</MenuItem>
        </NavDropdown>
      )
    }
    let projectControl
    if (!this.props.username) {
      projectControl = ('')
    } else if (!this.props.projects || !this.props.projects.active) {
      projectControl = ('') // (<NavItem href='#'>No project selected</NavItem>)
    } else {
      let activeProject = this.props.projects.active
      projectControl = (
        <NavDropdown
          title={<span><Glyphicon glyph='briefcase' /> {activeProject.name}</span>}
          id='basic-nav-dropdown'
        >
          {this.props.projects.all.map(proj => {
            return (
              <MenuItem
                key={proj.id}
                onClick={(evt) =>{
                  evt.preventDefault()
                  this.props.setActiveProject(proj)
                }}
              >{proj.name}</MenuItem>
            )
          })}
        </NavDropdown>
      )
    }

    let languageControl = (
      <NavDropdown
        title={<span><Glyphicon glyph='globe' /></span>}
        id='basic-nav-dropdown'
      >
        {this.props.languages.all ? this.props.languages.all.map(lang => {
          return (
            <MenuItem
              key={lang.id}
              active={this.props.languages.active.id === lang.id}
              onClick={(evt) =>{
                evt.preventDefault()
                this.props.setActiveLanguage(lang.id)
              }}
            >{lang.name}</MenuItem>
          )
        })
        : null
      }
      </NavDropdown>
    )

    const navBarStyle = {
      left: this.props.sidebarExpanded ? 130 : 50,
      height: '40px'
    }

    return (<div>
      <Navbar
        fixedTop
        style={navBarStyle}
      >
        <Navbar.Header>
          <Nav>
            <NavItem active>Manage</NavItem>
            <NavItem>Explore</NavItem>
            <NavItem>Edit</NavItem>
          </Nav>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          {this.props.breadcrumbs}
          {/*
          <Nav pullRight>
            {projectControl}
            {this.props.docsUrl
              ? <NavItem href={this.props.docsUrl} active={this.props.docsUrl === '#'}>
                  <Glyphicon glyph='question-sign' /> {getMessage(messages, 'guide')}
                </NavItem>
              : null
            }
            {userControl}
            {languageControl}
          </Nav>
          */}
        </Navbar.Collapse>
      </Navbar>
    </div>)
  }
}
