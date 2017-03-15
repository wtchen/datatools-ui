import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap'

import { isExtensionEnabled } from '../../common/util/config'

export default class ThirdPartySyncButton extends Component {
  render () {
    const { projectEditDisabled, thirdPartySync } = this.props
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
            onClick={(evt) => {
              thirdPartySync('TRANSITLAND')
            }}
          >
            <Glyphicon glyph='refresh' /> transit.land
          </MenuItem>
          : null
        }
        {isExtensionEnabled('transitfeeds')
          ? <MenuItem
            bsStyle='primary'
            disabled={projectEditDisabled}
            id='TRANSITFEEDS'
            onClick={(evt) => {
              thirdPartySync('TRANSITFEEDS')
            }}
          >
            <Glyphicon glyph='refresh' /> transitfeeds.com
          </MenuItem>
          : null
        }
        {isExtensionEnabled('mtc')
          ? <MenuItem
            bsStyle='primary'
            disabled={projectEditDisabled}
            id='MTC'
            onClick={(evt) => {
              thirdPartySync('MTC')
            }}
          >
            <Glyphicon glyph='refresh' /> MTC
          </MenuItem>
          : null
        }
      </DropdownButton>
    )
  }
}
