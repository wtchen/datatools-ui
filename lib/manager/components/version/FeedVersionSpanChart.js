// @flow

import moment from 'moment'
import React, { Component } from 'react'
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap'

import type { FeedVersion } from '../../../types'

type Props = {
  activeVersion: FeedVersion,
  comparedVersion: FeedVersion
}

const dateFormat = 'MMM. D, YYYY'
const todayDateFormat = 'MMM. D'

const cellStyle = {
  border: 'none',
  padding: '0 5px'
}

/**
 * This component renders bars representing the date ranges for which the given feed versions
 * are valid (e.g., Jan 1 - March 27) and lets the user visualize overlaps or gaps in the validity periods
 * of the active and compared feed versions.
 */
export default class FeedVersionSpanChart extends Component<Props> {
  render () {
    const { activeVersion, comparedVersion } = this.props
    // Construct moment objects for the active/compared version start/end dates.
    const activeStartDate = moment(activeVersion.validationSummary.startDate)
    const activeEndDate = moment(activeVersion.validationSummary.endDate)
    const comparedStartDate = moment(comparedVersion.validationSummary.startDate)
    const comparedEndDate = moment(comparedVersion.validationSummary.endDate)

    const firstDate = moment.min(activeStartDate, comparedStartDate)
    const lastDate = moment.max(activeEndDate, comparedEndDate)

    const earliestEnd = moment.min(activeEndDate, comparedEndDate)
    const latestStart = moment.max(activeStartDate, comparedStartDate)

    return (
      <Table>
        <tbody>
          <tr>
            <td style={{fontWeight: 800, ...cellStyle}}>Version {activeVersion.version} (selected)</td>
            <td style={{fontWeight: 800, ...cellStyle}}>
              <FeedSpan
                firstDate={firstDate}
                lastDate={lastDate}
                isServiceGap={false}
                showToday
                versionStartDate={activeStartDate}
                versionEndDate={activeEndDate}
              />
            </td>
          </tr>
          {/* Highlight gap in service if one exists */}
          {latestStart.diff(earliestEnd, 'days') > 0 &&
            <tr style={{height: '1em'}}>
              {/* Cell placeholder to prevent formatting issues */}
              <td className='text-danger' style={cellStyle}>Gap in service</td>
              <td style={cellStyle}>
                <FeedSpan
                  firstDate={firstDate}
                  isServiceGap
                  lastDate={lastDate}
                  showToday={false}
                  versionStartDate={earliestEnd}
                  versionEndDate={latestStart}
                />
              </td>
            </tr>
          }
          <tr>
            <td style={cellStyle}>Version {comparedVersion.version}</td>
            <td style={cellStyle}>
              <FeedSpan
                firstDate={firstDate}
                lastDate={lastDate}
                isServiceGap={false}
                showToday={false}
                versionStartDate={comparedStartDate}
                versionEndDate={comparedEndDate}
              />
            </td>
          </tr>
        </tbody>
      </Table>
    )
  }
}

// Width of feed span
const WIDTH_PIXELS = 400
// HACK: Set a fixed offset when positioning the 'today' tooltip,
// since we cannot easily get the width of the 'today' tooltip text.
const TODAY_OFFSET_PIXELS = 45

/** Renders the validity span of one feed using the given props. */
const FeedSpan = ({
  firstDate,
  lastDate,
  isServiceGap = false,
  showToday = false,
  versionStartDate,
  versionEndDate
}) => {
  const totalDays = lastDate.diff(firstDate, 'days')
  const versionOffset = versionStartDate.diff(firstDate, 'days')
  const daysActive = versionEndDate.diff(versionStartDate, 'days')
  const endLabel = versionEndDate.format(dateFormat)
  const relativeLength = daysActive / totalDays
  const relativeOffset = versionOffset / totalDays
  const startLabel = versionStartDate.format(dateFormat)

  const today = moment()
  const todayOffset = today.diff(firstDate, 'days')
  // Show a 'today' arrow/bubble if today is not outside of the entire range.
  const shouldShowToday = showToday && todayOffset >= 0 && todayOffset <= totalDays

  // Date labels and validity span occupy a third of the width available.
  const baseWidth = WIDTH_PIXELS / 3
  return (
    <div style={{position: 'relative', width: `${WIDTH_PIXELS}px`}}>
      <div style={{left: `${relativeOffset * baseWidth}px`, position: 'absolute'}}>
        <span style={{display: 'inline-block', textAlign: 'right', width: `${baseWidth}px`}}>
          {isServiceGap ? null : startLabel}
        </span>
        <OverlayTrigger
          placement='bottom'
          overlay={
            <Tooltip id={`feed-span`}>
              {isServiceGap && 'No service for'}{' '}
              {daysActive} days
            </Tooltip>
          }>
          <span
            style={{
              backgroundColor: isServiceGap ? 'red' : 'grey',
              display: 'inline-block',
              height: '.75em',
              margin: '0 5px',
              width: `${relativeLength * baseWidth}px`,
              verticalAlign: '0px'
            }}
          />
        </OverlayTrigger>
        <span>{isServiceGap ? null : endLabel}</span>

        {shouldShowToday && (
          <Tooltip
            arrowOffsetLeft={TODAY_OFFSET_PIXELS}
            className='in'
            id={`today-tip`}
            placement={'top'}
            positionLeft={baseWidth - TODAY_OFFSET_PIXELS + todayOffset / totalDays * baseWidth}
            positionTop={-25}
          >
            {`Today - ${today.format(todayDateFormat)}`}
          </Tooltip>
        )}
      </div>
    </div>
  )
}
