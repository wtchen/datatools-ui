import React from 'react'
import { Panel, Grid, Row, Col, Button } from 'react-bootstrap'

import CreateUser from './createuser'
import UserSettings from './UserSettings'
import UserPermissions from '../../common/user/UserPermissions'

export default class UserList extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    return (

      <Grid>
        <Row>
          <Col xs={12}>
            <h2>User Management</h2>
          </Col>
        </Row>

        <Row>
          <Col xs={8}>
            <h3>All Users</h3>
          </Col>
          <Col xs={4}>
            <CreateUser
              projects={this.props.projects}
              createUser={this.props.createUser.bind(this)}
            />
          </Col>
        </Row>

        {this.props.users.map((user, i) => {
          return <UserRow
            projects={this.props.projects}
            user={user}
            key={i}
            fetchProjectFeeds={this.props.fetchProjectFeeds}
            // setUserPermission={this.props.setUserPermission}
            saveUser={this.props.saveUser.bind(this)}
            token={this.props.token}
          />
        })}

      </Grid>
    )
  }
}

class UserRow extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }
  }

  toggleExpansion () {
    if (this.state.isEditing) {
      this.save()
    }

    this.setState({
      isEditing: !this.state.isEditing
    })
  }

  save () {
    console.log('saving ', this.props.user)

    const settings = this.refs.userSettings.getSettings()
    const type = ['projects', 'permissions']
    console.log(settings)
    console.log(this.props.user)
    this.props.saveUser(this.props.user, settings)
  }

  render () {
    let permissions = new UserPermissions(this.props.user.app_metadata ? this.props.user.app_metadata.datatools : null)
    return (
      <Panel bsStyle='primary' collapsible expanded={this.state.isEditing} header={
        <Row>
          <Col xs={8}>
            <h4>{this.props.user.email}</h4>
          </Col>
          <Col xs={4}>
            <Button className='pull-right' onClick={this.toggleExpansion.bind(this)}>
              {this.state.isEditing ? 'Save' : 'Edit'}
            </Button>
          </Col>
        </Row>
      }>
        { this.state.isEditing ?
          <UserSettings ref='userSettings'
            projects={this.props.projects}
            fetchProjectFeeds={this.props.fetchProjectFeeds}
            permissions={permissions}
          /> : ''
        }
      </Panel>
    )
  }
}
