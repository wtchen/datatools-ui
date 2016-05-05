import React  from 'react'
import { Button, Modal, Input } from 'react-bootstrap'

import UserSettings  from './UserSettings'
import UserPermissions from '../../common/user/UserPermissions'

export default class CreateUser extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
  }

  save () {
    this.setState({
      showModal: false
    })
    this.props.createUser({email: this.refs.email.getValue(), password: this.refs.password.getValue(), permissions: this.refs.userSettings.getSettings()})
  }

  cancel () {
    this.setState({
      showModal: false
    })
  }

  open () {
    console.log('opening..')
    this.setState({
      showModal: true
    })
  }

  render () {
    return (
      <div>
        <Button
          bsStyle='primary'
          bsSize='large'
          onClick={this.open.bind(this)}
          className='pull-right'
        >
          Create User
        </Button>

        <Modal show={this.state.showModal} onHide={this.cancel.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input ref='email' type='email' label='Email Address' placeholder='Enter email' />
            <Input ref='password' type='password' label='Password' />
            <UserSettings
              projects={this.props.projects}
              fetchProjectFeeds={this.props.fetchProjectFeeds}
              permissions={new UserPermissions()}
              ref='userSettings'
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.save.bind(this)}>Create User</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
