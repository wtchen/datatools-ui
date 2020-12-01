// @flow

import moment from 'moment'
import React, { Component } from 'react'
import { Table } from 'react-bootstrap'

import type { FeedVersion } from '../../../types'

type Props = {
  activeVersion: FeedVersion,
  comparedVersion: FeedVersion,
  // Used for display only.
  comparedVersionIndex: number
}

// Type used for rendering FeedSpan sub-components.
type VersionDateRange = {
  // Number of days for this range
  days: number,
  endDate: moment$Moment,
  // Length and offset should be ratios.
  length: number,
  offset: number,
  startDate: moment$Moment
}

type VersionDateRanges = {
  v1Range: VersionDateRange,
  v2Range: VersionDateRange
}

const dateFormat = 'MMM. DD, YYYY'

const noTopPadding = { padding: '0 5px' }

function getDateRange (version: FeedVersion): VersionDateRange {
  const { validationSummary: vs } = version
  const startDate = moment(vs.startDate)
  const endDate = moment(vs.endDate)

  return {
    days: endDate.diff(startDate, 'days'),
    endDate,
    length: 0,
    offset: 0,
    startDate
  }
}

/**
 * Obtains the date range objects for the provided feed versions.
 */
function extractVersionDateRanges (v1: FeedVersion, v2: FeedVersion): VersionDateRanges {
  const v1Range = getDateRange(v1)
  const v2Range = getDateRange(v2)

  const firstDate = moment.min(v1Range.startDate, v2Range.startDate)
  const lastDate = moment.max(v1Range.endDate, v2Range.endDate)
  const numDays = lastDate.diff(firstDate, 'days')

  v1Range.offset = v1Range.startDate.diff(firstDate, 'days') / numDays
  v1Range.length = v1Range.days / numDays
  v2Range.offset = v2Range.startDate.diff(firstDate, 'days') / numDays
  v2Range.length = v2Range.days / numDays

  return {
    v1Range,
    v2Range
  }
}

/**
 * This component renders bars representing the date ranges for which the given feed versions
 * are valid (e.g., Jan 1 - March 27) and lets the user visualize overlaps or gaps in the validity periods
 * of the active and compared feed versions.
 */
export default class FeedVersionSpanChart extends Component<Props> {
  render () {
    const { activeVersion, comparedVersion, comparedVersionIndex } = this.props
    const { v1Range: activeRange, v2Range: comparedRange } =
      extractVersionDateRanges(activeVersion, comparedVersion)

    return (
      <Table bordered condensed>
        <tbody>
          <tr>
            <td style={noTopPadding}>This version</td>
            <td style={noTopPadding}>
              <FeedSpan
                range={activeRange}
                widthPixels={400}
              />
            </td>
          </tr>
          <tr>
            <td style={noTopPadding}>Version {comparedVersionIndex}</td>
            <td style={noTopPadding}>
              <FeedSpan
                range={comparedRange}
                widthPixels={400}
              />
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }
}

/** Renders the validity span of one feed using the given props. */
const FeedSpan = ({
  range,
  widthPixels
}) => {
  const { endDate, length, offset, startDate } = range
  // Date labels and validity span occupy a third of the width available.
  const baseWidth = widthPixels / 3

  return (
    <div style={{position: 'relative', width: `${widthPixels}px`}}>
      <div style={{left: `${offset * baseWidth}px`, position: 'absolute'}}>
        <span style={{display: 'inline-block', textAlign: 'right', width: `${baseWidth}px`}}>
          {startDate.format(dateFormat)}
        </span>
        <span
          className='label-default'
          style={{
            display: 'inline-block',
            height: '1em',
            margin: '0 5px',
            width: `${length * baseWidth}px`
          }}
        />
        <span>{endDate.format(dateFormat)}</span>
      </div>
    </div>
  )
}
