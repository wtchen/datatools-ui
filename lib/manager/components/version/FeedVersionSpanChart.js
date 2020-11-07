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

const FeedSpan = ({ relativeLength, relativeOffset, ...props }) => {
  return (
    <div {...props} style={{...props.style, height: '1em', position: 'relative'}}>
      <div className='label-success' style={{height: '100%', left: `${relativeOffset * 100}%`, position: 'absolute', width: `${relativeLength * 100}%`}} />
    </div>
  )
}

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
    /*
    const data = dailyTripCounts
      .slice(0, maxDaysToShow)
      .map((count, index) => [firstDate.clone().add(index, 'days'), count])
    const graphHeight = 30
    const spacing = 8
    const leftMargin = 50
    const rightMargin = 50
    const bottomMargin = 75
    const svgWidth = leftMargin + rightMargin + (data.length * spacing)
    const svgHeight = graphHeight + bottomMargin
    const maxTrips = Math.max.apply(Math, data.map(d => d[1]))
    const yAxisMax = getChartMax(maxTrips)
    const rowHeight = 20

    const yAxisLabels = [
      `Version ${activeVersionIndex}`,
      `Version ${comparedVersionIndex}`
    ]
*/
    return (
      <Table bordered condensed>
        <tbody>
          <tr>
            <td>This version</td>
            <td>{activeVersion.validationSummary.startDate}</td>
            <td><FeedSpan relativeLength={activeVersionLength / numDays} relativeOffset={activeVersionOffset / numDays} style={{width: '200px'}} /></td>
            <td>{activeVersion.validationSummary.endDate}</td>
          </tr>
          <tr>
            <td>Version {comparedVersionIndex}</td>
            <td>{comparedVersion.validationSummary.startDate}</td>
            <td><FeedSpan relativeLength={comparedVersionLength / numDays} relativeOffset={comparedVersionOffset / numDays} style={{width: '200px'}} /></td>
            <td>{comparedVersion.validationSummary.endDate}</td>
          </tr>
        </tbody>
      </Table>
    )
  }
}
