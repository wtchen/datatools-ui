// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button } from 'react-bootstrap'

import * as signsActions from '../actions/signs'

type Props = {
  createSign: typeof signsActions.createSign,
  disabled: boolean,
  fetched: boolean
}

export default class CreateAlert extends Component<Props> {
  render () {
    const {
      createSign,
      disabled,
      fetched
    } = this.props
    const createDisabled = disabled != null
      ? disabled || !fetched
      : false
    return (
      <Button
        bsStyle='primary'
        bsSize='large'
        disabled={createDisabled}
        onClick={createSign}
        className='pull-right'>
        {fetched
          ? 'New Configuration'
          : <span>Fetching configurations <Icon className='fa-spin' type='refresh' /></span>
        }
      </Button>
    )
  }
}
