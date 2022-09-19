// @flow

import type { Auth0ContextInterface } from '@auth0/auth0-react'
import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, Checkbox, Modal } from 'react-bootstrap'

import * as userActions from '../../manager/actions/user'

type Props = {
  auth0: Auth0ContextInterface,
  logout: typeof userActions.logout,
  termsUrl: string
}

type State = {
  termsAccepted: boolean
}

export default class LicenseTerms extends Component<Props, State> {
  state = {
    termsAccepted: false
  }

  _onLogoutClick = () => {
    this.props.logout(this.props.auth0)
  }

  _onTermsAccepted = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ termsAccepted: evt.target.checked })
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
          <form>
            <Checkbox onClick={this._onTermsAccepted} style={{ textAlign: 'left' }}>
                I accept the above terms.
            </Checkbox>
            <Button onClick={this._onLogoutClick}>
              <Icon type='times' /> Close and Logout
            </Button>
            <Button bsStyle='primary' disabled={!termsAccepted} type='submit'>
              <Icon type='arrow-circle-right' /> Continue
            </Button>
          </form>
        </Modal.Footer>
      </Modal>
    )
  }
}
