// @flow

import type { Auth0ContextInterface } from '@auth0/auth0-react'
import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, Checkbox, Modal } from 'react-bootstrap'
import { browserHistory } from 'react-router'

import * as userActions from '../../manager/actions/user'
import type { ManagerUserState } from '../../types/reducers'

type Props = {
  acceptAccountTerms: typeof userActions.acceptAccountTerms,
  auth0: Auth0ContextInterface,
  logout: typeof userActions.logout,
  returnTo: ?string,
  termsUrl: string,
  user: ManagerUserState
}

type State = {
  termsAccepted: boolean
}

export default class LicenseTerms extends Component<Props, State> {
  state = {
    termsAccepted: false
  }

  handleLogout = () => {
    this.props.logout(this.props.auth0)
  }

  handleTermsAccepted = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ termsAccepted: evt.target.checked })
  }

  handleContinue = async () => {
    const { returnTo, user } = this.props
    if (user.profile) {
      // await acceptAccountTerms(user.profile)
      browserHistory.push(returnTo || '/home')
    }
  }

  render () {
    const { termsUrl } = this.props
    const { termsAccepted } = this.state
    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>License Terms</Modal.Title>
        </Modal.Header>

        {/* Skipping <Modal.Body> here because it will introduce unnecessary padding. */}
        <iframe
          src={termsUrl}
          style={{ border: 'none', height: '400px', width: '100%' }}
          title='Content of license terms'
        />

        <Modal.Footer>
          <Checkbox onClick={this.handleTermsAccepted} style={{ textAlign: 'left' }}>
              I accept the above terms.
          </Checkbox>
          <Button onClick={this.handleLogout}>
            <Icon type='times' /> Close and Logout
          </Button>
          <Button bsStyle='primary' disabled={!termsAccepted} onClick={this.handleContinue}>
            <Icon type='arrow-circle-right' /> Continue
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
