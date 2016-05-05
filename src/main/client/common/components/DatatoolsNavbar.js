import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'

import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { browserHistory, Link } from 'react-router'

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
    resetPasswordHandler: PropTypes.func
  };

  render () {
    var userControl
    if (!this.props.username) {
      userControl = (<NavItem onClick={this.props.loginHandler} href='#'>Log In</NavItem>)
    } else {
      userControl = (
        <NavDropdown title={
          <span><Glyphicon glyph='user' /> {this.props.username}</span>
        } id='basic-nav-dropdown'>
        <MenuItem onClick={() => browserHistory.push('/account')}>My Account</MenuItem>
          <MenuItem onClick={this.props.resetPasswordHandler}>Reset Password</MenuItem>
          <MenuItem onClick={this.props.logoutHandler}>Log Out</MenuItem>
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
    const navBarStyle = this.props.noMargin ? {marginBottom: 0} : {}

    return (
      <Navbar
        style={navBarStyle}
      >
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/'>{this.props.title}</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {this.props.managerUrl && this.props.username
              ? <LinkContainer to={this.props.managerUrl}>
                  <NavItem>Manager</NavItem>
                </LinkContainer>
              : null
            }
            {this.props.editorUrl && this.props.username
              ? <NavItem href={this.props.editorUrl} active={this.props.editorUrl === '#'}>
                  Editor
                </NavItem>
              : null
            }
            {this.props.alertsUrl && this.props.username
              ? <LinkContainer to={this.props.alertsUrl}>
                  <NavItem>Alerts</NavItem>
                </LinkContainer>
              : null
            }
            {this.props.userAdminUrl && this.props.userIsAdmin
              ? <LinkContainer to={this.props.userAdminUrl}>
                  <NavItem>Users</NavItem>
                </LinkContainer>
              : null
            }
            {this.props.signConfigUrl && this.props.username
              ? <LinkContainer to={this.props.signConfigUrl}>
                  <NavItem>eTID Config</NavItem>
                </LinkContainer>
              : null
            }
          </Nav>
          <Nav pullRight>
            {projectControl}
            {this.props.docsUrl
              ? <NavItem href={this.props.docsUrl} active={this.props.docsUrl === '#'}>
                  <Glyphicon glyph='question-sign' /> Guide
                </NavItem>
              : null
            }
            {userControl}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}
