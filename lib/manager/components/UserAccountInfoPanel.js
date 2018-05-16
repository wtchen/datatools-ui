import React, {Component, PropTypes} from 'react'
import { Panel, Badge, Row, Col } from 'react-bootstrap'

import UserButtons from '../../common/components/UserButtons'

export default class UserAccountInfoPanel extends Component {
  static propTypes = {
    user: PropTypes.object,
    logoutHandler: PropTypes.func
  }

  render () {
    const {
      user,
      logoutHandler
    } = this.props
    // const userOrganization = user.permissions.getOrganizationId()
    return (
      <Panel>
        <Row>
          <Col xs={4}>
            <img alt='Profile' style={{ width: '100%', borderRadius: '50%' }} src={user.profile.picture} />
          </Col>
          <Col md={8}>
            <h4 style={{marginTop: 0, marginBottom: 15}}>
              Hello, {user.profile.nickname}.
            </h4>
            <div className='text-muted'>{user.profile.email}</div>
            <div>
              <Badge className='text-muted'>
                {user.permissions.isApplicationAdmin()
                  ? 'Application admin'
                  : user.permissions.canAdministerAnOrganization()
                  ? 'Organization admin'
                  : 'Standard user'
                }
              </Badge>
              {/* TODO: fetch organization for user and show badge here */}
              {' '}
              {/* userOrganization &&
                <Badge className='text-muted'>
                  user.permissions.getOrganizationId()
                </Badge>
              */}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <UserButtons user={user} logoutHandler={logoutHandler} />
          </Col>
        </Row>
      </Panel>
    )
  }
}
