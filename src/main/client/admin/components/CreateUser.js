import React  from 'react'
import { Button, Modal, FormControl, ControlLabel, FormGroup, Glyphicon } from 'react-bootstrap'

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
    const messages = DT_CONFIG.messages.active.CreateUser
    return (
      <div>
        <Button
          bsStyle='primary'
          bsSize='large'
          onClick={this.open.bind(this)}
          className='pull-right'
        >
          <Glyphicon glyph='plus' />&nbsp;
          Create User
        </Button>

        <Modal show={this.state.showModal} onHide={this.cancel.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup controlId="formControlsEmail">
              <ControlLabel>Email Address</ControlLabel>
              <FormControl ref='email' type='email' placeholder='Enter email' />
            </FormGroup>
            <FormGroup controlId="formControlsPassword">
              <ControlLabel>Password</ControlLabel>
              <FormControl ref='password' type='password' />
            </FormGroup>
            <UserSettings
              projects={this.props.projects}
              fetchProjectFeeds={this.props.fetchProjectFeeds}
              permissions={new UserPermissions()}
              ref='userSettings'
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.save.bind(this)}>{messages.new}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
