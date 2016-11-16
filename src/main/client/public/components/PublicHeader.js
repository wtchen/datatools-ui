import React, {Component, PropTypes} from 'react'
import {Icon} from '@conveyal/woonerf'
import { Grid, Row, Col, Button, Glyphicon, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import { getConfigProperty } from '../../common/util/config'

export default class PublicHeader extends Component {

  static propTypes = {
    title: PropTypes.string,
    username: PropTypes.string,

    loginHandler: PropTypes.func,
    logoutHandler: PropTypes.func,
    resetPassword: PropTypes.func
  }

  render () {
    const userDropdown = <DropdownButton bsStyle='info'
        title={<span><Glyphicon glyph='user'/> {this.props.username}</span>}
      >
        <MenuItem onClick={() => browserHistory.push('/settings/profile')}>My Account</MenuItem>
        <MenuItem onClick={() => this.props.resetPassword()}>Change Password</MenuItem>
        <MenuItem onClick={() => this.props.logoutHandler()}>Log Out</MenuItem>
      </DropdownButton>
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
              ? <LinkContainer to='/home'>
                  <Button>
                    <span><img height={20} width={20} src={this.props.userPicture}/> My dashboard</span>
                  </Button>
                </LinkContainer>
              : <Button bsStyle='primary' onClick={() => this.props.loginHandler()}>
                  <Glyphicon glyph='log-in'/> Log In
                </Button>
            }

            {/* "Create Account" Button (only show if no active user) */}
            {this.props.username || getConfigProperty('modules.enterprise.enabled')
              ? null
              : <Button bsStyle='success' onClick={() => { browserHistory.push('/signup') }}>
                  <Glyphicon glyph='plus'/> Create Account
                </Button>
            }

            {/* "Log out" Button */}
            {this.props.username
              ? <Button bsStyle='primary' onClick={() => this.props.logoutHandler()}><Icon type='sign-out'/> Log Out</Button>
              : null
            }

          </ButtonToolbar>
        </Col>
      </Row></Grid>
    )
  }
}
