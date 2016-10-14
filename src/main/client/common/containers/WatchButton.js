import React, { PropTypes, Component } from 'react'
import { Button, Glyphicon, MenuItem } from 'react-bootstrap'
import { updateTargetForSubscription } from '../../manager/actions/user'
import { connect } from 'react-redux'

import { getComponentMessages, getMessage, getConfigProperty } from '../util/config'

class WatchButton extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    isWatching: PropTypes.string,
    user: PropTypes.object,
    target: PropTypes.string,
    subscriptionType: PropTypes.string,
    componentClass: PropTypes.string
  }
  render () {
    const {dispatch, isWatching, user, target, subscriptionType} = this.props
    const messages = getComponentMessages('WatchButton')

    if (!getConfigProperty('application.notifications_enabled')) {
      return null
    }
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
    } else {
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

export default connect()(WatchButton)
