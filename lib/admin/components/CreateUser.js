// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button, Modal, FormControl, ControlLabel, FormGroup} from 'react-bootstrap'

import UserSettings from './UserSettings'
import UserPermissions from '../../common/user/UserPermissions'
import {getComponentMessages, getMessage} from '../../common/util/config'

import type {UserState} from '../../manager/reducers/user'
import type {Organization, Project} from '../../types'

type Props = {
  createUser: ({email: string, password: string, permissions: UserPermissions}) => void,
  fetchProjectFeeds: string => void,
  projects: Array<Project>,
  creatingUser: UserState,
  organizations: Array<Organization>
}

type State = {
  email: string,
  password: string,
  showModal: boolean
}

export default class CreateUser extends Component<Props, State> {
  state = {
    email: '',
    password: '',
    showModal: false
  }

  save = (e: any) => {
    e.preventDefault()
    if (!e.target.checkValidity()) {
      console.warn('Form inputs are invalid!')
      return
    }
    this.setState({showModal: false})
    const {email, password} = this.state
    this.props.createUser({
      email,
      password,
      permissions: this.refs.userSettings.getSettings()
    })
  }

  cancel () {
    this.setState({
      showModal: false
    })
  }

  open = () => {
    this.setState({
      showModal: true
    })
  }

  render () {
    const messages = getComponentMessages('CreateUser')
    const {
      creatingUser,
      organizations,
      projects,
      fetchProjectFeeds
    } = this.props
    return (
      <div>
        <Button
          bsStyle='primary'
          onClick={this.open}
          className='pull-right'>
          <Icon type='plus' />{' '}
          Create User
        </Button>
        <Modal show={this.state.showModal} onHide={this.cancel.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <form onSubmit={this.save}>
            <Modal.Body>
              <FormGroup controlId='formControlsEmail'>
                <ControlLabel>Email Address</ControlLabel>
                <FormControl
                  ref='email'
                  autoFocus
                  value={this.state.email}
                  autoComplete='username email'
                  type='email'
                  placeholder='Enter email' />
              </FormGroup>
              <FormGroup controlId='formControlsPassword'>
                <ControlLabel>Password</ControlLabel>
                <FormControl
                  ref='password'
                  value={this.state.password}
                  minLength='8'
                  type='password'
                  placeholder='Enter password for new user'
                  autoComplete='new-password' />
              </FormGroup>
              <UserSettings
                projects={projects}
                organizations={organizations}
                fetchProjectFeeds={fetchProjectFeeds}
                creatingUser={creatingUser}
                permissions={new UserPermissions()}
                isCreating
                ref='userSettings' />
            </Modal.Body>
            <Modal.Footer>
              <Button type='submit'>{getMessage(messages, 'new')}</Button>
            </Modal.Footer>
          </form>
        </Modal>
      </div>
    )
  }
}
