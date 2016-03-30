import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'

import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

class PublicNavbar extends Component {

  static propTypes = {
    title: PropTypes.string,
    username: PropTypes.string,
    managerUrl: PropTypes.string,
    editorUrl: PropTypes.string,
    userAdminUrl: PropTypes.string,
    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPasswordHandler: PropTypes.func
  };

  render () {
    var userControl
    if (!this.props.username) {
      userControl = <NavItem onClick={this.props.loginHandler} href='#'>Log In</NavItem>
    } else {
      userControl =
        <NavDropdown title={
          <span><Glyphicon glyph='user' /> {this.props.username}</span>
        } id='basic-nav-dropdown'>
          <LinkContainer to={{ pathname: '/account' }}>
            <MenuItem>Account</MenuItem>
          </LinkContainer>
          <MenuItem onClick={this.props.resetPasswordHandler}>Reset Password</MenuItem>
          <MenuItem onClick={this.props.logoutHandler}>Log Out</MenuItem>
        </NavDropdown>
    }

    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='#'>{this.props.title}</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem href='#'><Glyphicon glyph='question-sign' /> Guide</NavItem>
          {userControl}
        </Nav>
      </Navbar>
    )
  }
}

module.exports = PublicNavbar

// set up global function for use in legacy applications
function RenderPublicNavbar (options) {
  ReactDOM.render(<PublicNavbar
    title={options.title}
    username={options.username}
    managerUrl={options.managerUrl}
    editorUrl={options.editorUrl}
    userAdminUrl={options.userAdminUrl}
    loginHandler={options.loginHandler}
    logoutHandler={options.logoutHandler}
    resetPasswordHandler={options.resetPasswordHandler}
  />, document.getElementById(options.elementId))
}

window.RenderPublicNavbar = RenderPublicNavbar
