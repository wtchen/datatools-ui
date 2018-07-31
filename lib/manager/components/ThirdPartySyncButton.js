// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap'

import { isExtensionEnabled } from '../../common/util/config'

type Props = {
  projectEditDisabled: boolean,
  thirdPartySync: string => void
}

export default class ThirdPartySyncButton extends Component<Props> {
  _onClickMTC = (evt: SyntheticMouseEvent<HTMLInputElement>) =>
    this.props.thirdPartySync('MTC')

  _onClickTransitLand = (evt: SyntheticMouseEvent<HTMLInputElement>) =>
    this.props.thirdPartySync('TRANSITLAND')

  _onClickTransitFeeds = (evt: SyntheticMouseEvent<HTMLInputElement>) =>
    this.props.thirdPartySync('TRANSITFEEDS')

  render () {
    const {projectEditDisabled} = this.props
    return (
      <DropdownButton
        id='sync-dropdown'
        bsStyle='success'
        disabled={projectEditDisabled}
        title={<span><Icon type='refresh' /> Sync</span>}>
        {isExtensionEnabled('transitland')
          ? <MenuItem
            bsStyle='primary'
            disabled={projectEditDisabled}
            id='TRANSITLAND'
            onClick={this._onClickTransitLand}>
            <Glyphicon glyph='refresh' /> transit.land
          </MenuItem>
          : null
        }
        {isExtensionEnabled('transitfeeds')
          ? <MenuItem
            bsStyle='primary'
            disabled={projectEditDisabled}
            id='TRANSITFEEDS'
            onClick={this._onClickTransitFeeds}>
            <Glyphicon glyph='refresh' /> transitfeeds.com
          </MenuItem>
          : null
        }
        {isExtensionEnabled('mtc')
          ? <MenuItem
            bsStyle='primary'
            disabled={projectEditDisabled}
            id='MTC'
            onClick={this._onClickMTC}>
            <Glyphicon glyph='refresh' /> MTC
          </MenuItem>
          : null
        }
      </DropdownButton>
    )
  }
}
