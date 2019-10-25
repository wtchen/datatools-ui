// @flow

import React, {Component} from 'react'
import {Button, Glyphicon, MenuItem} from 'react-bootstrap'
import {connect} from 'react-redux'

import {
  resendEmailConfirmation,
  updateTargetForSubscription
} from '../../manager/actions/user'
import {setErrorMessage} from '../../manager/actions/status'
import {getComponentMessages, getConfigProperty} from '../util/config'

import type {AppState, ManagerUserState} from '../../types/reducers'

type ContainerProps = {
  componentClass?: string,
  isWatching: ?boolean,
  subscriptionType: string,
  target: string,
  user: ManagerUserState
}

type Props = ContainerProps & {
  resendEmailConfirmation: typeof resendEmailConfirmation,
  setErrorMessage: typeof setErrorMessage,
  updateTarget: typeof updateTargetForSubscription
}

class WatchButton extends Component<Props> {
  messages = getComponentMessages('WatchButton')

  _onToggleWatch = () => {
    const {
      isWatching,
      resendEmailConfirmation,
      setErrorMessage,
      subscriptionType,
      target,
      updateTarget,
      user
    } = this.props
    if (user.profile) {
      if (!isWatching && !user.profile.email_verified) {
        if (confirm(this.messages('emailVerificationConfirm'))) {
          resendEmailConfirmation(user)
            .then((result: boolean) => {
              if (result) {
                // success. Display a dialog that asks user to reload
                // $FlowFixMe error doesn't make sense
                setErrorMessage({
                  action: 'RELOAD',
                  message: this.messages('verificationSent'),
                  title: 'Success!'
                })
              } else {
                // Response from server indicates error, display error message
                setErrorMessage({
                  message: this.messages('verificationSendError')
                })
              }
            })
            .catch(err => {
              // An error got thrown, display error message with error detail
              setErrorMessage({
                detail: err,
                message: this.messages('verificationSendError')
              })
            })
        }
      } else {
        updateTarget(user.profile, target, subscriptionType)
      }
    } else {
      console.warn('User profile not found. Cannot update subscription', user)
    }
  }

  _getLabel = () => {
    const {isWatching} = this.props
    return (
      <span>
        <Glyphicon glyph={`eye-${isWatching ? 'close' : 'open'}`} />{' '}
        {this.messages(isWatching ? 'unwatch' : 'watch')}
      </span>
    )
  }

  render () {
    const {componentClass} = this.props
    // Do not render watch button if notifications are not enabled.
    if (!getConfigProperty('application.notifications_enabled')) return null
    switch (componentClass) {
      case 'menuItem':
        return (
          <MenuItem
            onClick={this._onToggleWatch}>
            {this._getLabel()}
          </MenuItem>
        )
      default:
        return (
          <Button
            onClick={this._onToggleWatch}>
            {this._getLabel()}
          </Button>
        )
    }
  }
}

const mapDispatchToProps = {
  resendEmailConfirmation,
  setErrorMessage,
  updateTarget: updateTargetForSubscription
}

const mapStateToProps = (state: AppState, ownProps: ContainerProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WatchButton)
