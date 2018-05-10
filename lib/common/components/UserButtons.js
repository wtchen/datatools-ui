import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Icon from '@conveyal/woonerf/components/icon'

/**
 *  A common component containing buttons for standard user actions: "My
 *  Account", "Site Admin", and "Logout"
 */

export default class UserButtons extends Component {
  static propTypes = {
    logoutHandler: PropTypes.func,
    user: PropTypes.object
  }

  render () {
    const { logoutHandler, user } = this.props
    const buttonStyle = { margin: 2 }
    return (
      <div style={{ marginTop: 15, textAlign: 'center' }}>
        <LinkContainer to='/settings/profile'>
          <Button bsStyle='primary' bsSize='small' style={buttonStyle}>
            <Icon type='user' /> My account
          </Button>
        </LinkContainer>
        {user.permissions && user.permissions.isApplicationAdmin() &&
          user.permissions.canAdministerAnOrganization() && (
            <LinkContainer to='/admin/users'>
              <Button
                bsStyle='success'
                bsSize='small'
                style={buttonStyle}
              >
                <Icon type='cog' /> Site Admin
              </Button>
            </LinkContainer>
          )
        }
        <Button
          style={buttonStyle}
          bsSize='small'
          bsStyle='primary'
          onClick={logoutHandler}>
          <Icon type='sign-out' /> Logout
        </Button>
      </div>
    )
  }
}
