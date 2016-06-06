import React from 'react'
import { Button, Glyphicon } from 'react-bootstrap'
import { updateTargetForSubscription } from '../../manager/actions/user'
import { connect } from 'react-redux'

export class WatchButton extends React.Component {
  render () {
    console.log(this.props)
    const {dispatch, isWatching, user, target, subscriptionType} = this.props
    const messages = DT_CONFIG.messages.active.WatchButton

    if (!DT_CONFIG.application.notifications_enabled)
      return null

    return (
      <Button
        onClick={() => dispatch(updateTargetForSubscription(user.profile, target, subscriptionType)) }
      >
        {
          isWatching ? <span><Glyphicon glyph='eye-close'/> {messages.unwatch}</span>
          : <span><Glyphicon glyph='eye-open'/> {messages.watch}</span>
        }
      </Button>
    )
  }
}

export default connect()(WatchButton);
