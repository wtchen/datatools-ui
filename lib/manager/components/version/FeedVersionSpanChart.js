// @flow

import React, { Component } from 'react'
import { Table } from 'react-bootstrap'
import moment from 'moment'

import type { FeedVersion } from '../../../types'

type Props = {
  activeVersion: FeedVersion,
  activeVersionIndex: number,
  comparedVersion: FeedVersion,
  comparedVersionIndex: number
}

const dateFormat = 'MMM. DD, YYYY'

const FeedSpan = ({
  endLabel,
  relativeLength,
  relativeOffset,
  startLabel,
  widthPixels,
  ...props
}) => {
  return (
    <div {...props} style={{ position: 'relative', width: `${widthPixels}px` }}>
      <div
        style={{
          left: `${relativeOffset * widthPixels / 3}px`,
          position: 'absolute'
        }}>
        <span
          style={{ display: 'inline-block', textAlign: 'right', width: '8em' }}>{startLabel}</span>
        <span
          className='label-default'
          style={{
            display: 'inline-block',
            height: '1em',
            margin: '0 5px',
            width: `${relativeLength * widthPixels / 3}px`
          }}
        />
        <span>{endLabel}</span>
      </div>
    </div>
  )
}

const noTopPadding = {padding: '0 5px'}

export default class TripsChart extends Component<Props> {
  _renderFeedSpan = () => {
  }

  render () {
    const { activeVersion, comparedVersion, comparedVersionIndex } = this.props

    const activeVersionStartDate = moment(activeVersion.validationSummary.startDate)
    const activeVersionEndDate = moment(activeVersion.validationSummary.endDate)
    const comparedVersionStartDate = moment(comparedVersion.validationSummary.startDate)
    const comparedVersionEndDate = moment(comparedVersion.validationSummary.endDate)

    const firstDate = moment.min(activeVersionStartDate, comparedVersionStartDate)
    const lastDate = moment.max(activeVersionEndDate, comparedVersionEndDate)

    const numDays = lastDate.diff(firstDate, 'days')
    const activeVersionOffset = activeVersionStartDate.diff(firstDate, 'days')
    const activeVersionLength = activeVersionEndDate.diff(activeVersionStartDate, 'days')
    const comparedVersionOffset = comparedVersionStartDate.diff(firstDate, 'days')
    const comparedVersionLength = comparedVersionEndDate.diff(comparedVersionStartDate, 'days')

    return (
      <Table bordered condensed>
        <tbody>
          <tr>
            <td style={noTopPadding}>This version</td>
            <td style={noTopPadding}>
              <FeedSpan
                endLabel={activeVersionEndDate.format(dateFormat)}
                relativeLength={activeVersionLength / numDays}
                relativeOffset={activeVersionOffset / numDays}
                startLabel={activeVersionStartDate.format(dateFormat)}
                widthPixels={400}
              />
            </td>
          </tr>
          <tr>
            <td style={noTopPadding}>Version {comparedVersionIndex}</td>
            <td style={noTopPadding}>
              <FeedSpan
                endLabel={comparedVersionEndDate.format(dateFormat)}
                relativeLength={comparedVersionLength / numDays}
                relativeOffset={comparedVersionOffset / numDays}
                startLabel={comparedVersionStartDate.format(dateFormat)}
                widthPixels={400}
              />
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }
}
