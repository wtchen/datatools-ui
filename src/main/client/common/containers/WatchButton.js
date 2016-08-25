import React from 'react'
import { Button, Glyphicon, MenuItem } from 'react-bootstrap'
import { updateTargetForSubscription } from '../../manager/actions/user'
import { connect } from 'react-redux'

import { getComponentMessages, getMessage, getConfigProperty } from '../util/config'

class WatchButton extends React.Component {
  render () {
    const {dispatch, isWatching, user, target, subscriptionType} = this.props
    const messages = getComponentMessages('WatchButton')

    if (!getConfigProperty('application.notifications_enabled'))
      return null
    if (this.props.componentClass === 'menuItem') {
      return (
        <MenuItem
            onClick={() => dispatch(updateTargetForSubscription(user.profile, target, subscriptionType)) }
          >
          {
            isWatching ? <span><Glyphicon glyph='eye-close'/> {getMessage(messages, 'unwatch')}</span>
            : <span><Glyphicon glyph='eye-open'/> {getMessage(messages, 'watch')}</span>
          }
        </MenuItem>
      )
    }
    else {
      return (
        <Button
            onClick={() => dispatch(updateTargetForSubscription(user.profile, target, subscriptionType)) }
          >
            {
              isWatching ? <span><Glyphicon glyph='eye-close'/> {getMessage(messages, 'unwatch')}</span>
              : <span><Glyphicon glyph='eye-open'/> {getMessage(messages, 'watch')}</span>
            }
          </Button>
      )
    }
  }
}

export default connect()(WatchButton);
