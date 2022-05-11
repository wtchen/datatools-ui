// @flow

import React, {Component} from 'react'
import {Label as BsLabel} from 'react-bootstrap'
import moment from 'moment'

import type {FeedVersionSummary} from '../../../types'

type Props = {
  version: FeedVersionSummary
}

export default class VersionDateLabel extends Component<Props> {
  render () {
    const {version} = this.props
    const {validationResult: summary} = version
    if (!summary) return null
    const now = +moment().startOf('day')
    const start = +moment(summary.firstCalendarDate)
    const end = +moment(summary.lastCalendarDate)
    const future = start > now
    const expired = end < now
    const bsStyle = future ? 'info' : expired ? 'danger' : 'success'
    const text = future ? 'future' : expired ? 'expired' : 'active'
    return (
      <BsLabel
        bsStyle={bsStyle}>
        {text}
      </BsLabel>
    )
  }
}
