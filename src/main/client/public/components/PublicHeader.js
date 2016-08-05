import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Button, Glyphicon, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'
import { browserHistory } from 'react-router'

export default class PublicHeader extends Component {

  static propTypes = {
    title: PropTypes.string,
    username: PropTypes.string,

    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPasswordHandler: PropTypes.func
  }

  render () {
    return (
      <Grid><Row style={{ marginBottom: 20, marginTop: 40 }}>

        {/* Title Column */}
        <Col xs={6}>
          <h1 style={{ marginTop: 0 }}>{this.props.title}</h1>
        </Col>

        {/* Button Column*/}
        <Col xs={6} style={{ paddingTop: 2 }}>
          <ButtonToolbar className='pull-right'>
            {/* TODO: Add Language Selector */}

            {/* "Log In" Button or User Dropdown */}
            {this.props.username
              ? <DropdownButton bsStyle='info'
                  title={<span><Glyphicon glyph='user'/> {this.props.username}</span>}
                >
                  <MenuItem onClick={() => browserHistory.push('/account')}>My Account</MenuItem>
                  <MenuItem onClick={() => this.props.resetPasswordHandler()}>Change Password</MenuItem>
                  <MenuItem onClick={() => this.props.logoutHandler()}>Log Out</MenuItem>
                </DropdownButton>
              : <Button bsStyle='primary' onClick={() => this.props.loginHandler()}>
                  <Glyphicon glyph='log-in'/> Log In
                </Button>
            }

            {/* "Create Account" Button (only show if no active user) */}
            {this.props.username
              ? null
              : <Button bsStyle='success' onClick={() => { browserHistory.push('/signup') }}>
                  <Glyphicon glyph='plus'/> Create Account
                </Button>
            }

            {/* "Create Account" Button (only show if no active user) */}
            {this.props.username
              ? <Button bsStyle='primary' onClick={() => { browserHistory.push('/project') }}>
                  <Glyphicon glyph='share-alt'/> Manager Console
                </Button>
              : null
            }

          </ButtonToolbar>
        </Col>
      </Row></Grid>
    )
  }
}
