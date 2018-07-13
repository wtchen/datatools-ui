import React, { PropTypes, Component } from 'react'
import { Button, Glyphicon, MenuItem } from 'react-bootstrap'
import { updateTargetForSubscription } from '../../manager/actions/user'
import { connect } from 'react-redux'

import { getComponentMessages, getMessage, getConfigProperty } from '../util/config'

class WatchButton extends Component {
  static propTypes = {
    componentClass: PropTypes.string,
    isWatching: PropTypes.bool,
    subscriptionType: PropTypes.string,
    target: PropTypes.string,
    user: PropTypes.object,
    updateTarget: PropTypes.func
  }

  messages = getComponentMessages('WatchButton')

  _onToggleWatch = () => {
    const {updateTarget, user, target, subscriptionType} = this.props
    updateTarget(user.profile, target, subscriptionType)
  }

  _getLabel = () => {
    const {isWatching} = this.props
    return (
      <span>
        <Glyphicon glyph={`eye-${isWatching ? 'close' : 'open'}`} />{' '}
        {getMessage(this.messages, isWatching ? 'unwatch' : 'watch')}
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
  updateTarget: updateTargetForSubscription
}

const mapStateToProps = (state, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WatchButton)
