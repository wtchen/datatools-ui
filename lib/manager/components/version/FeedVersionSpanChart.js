// @flow

import moment from 'moment'
import React, { Component } from 'react'
import { Col, Grid, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'

import type { FeedVersion } from '../../../types'

type Props = {
  activeVersion: FeedVersion,
  comparedVersion: FeedVersion
}

const dateFormat = 'MMM. D, YYYY'
const todayDateFormat = 'MMM. D'

const BASE_HEIGHT_EM = 1.25
const HEIGHT_EM = `${BASE_HEIGHT_EM}em`
const SPAN_MARGIN_PIXELS = 5
const DATE_LABEL_ZINDEX = 9999
const TODAY_LABEL_ZINDEX = 9998

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
      <Grid>
        <Row>
          <Col xs={3}>
            <div style={{height: HEIGHT_EM}}>Version {activeVersion.version} (selected)</div>
            {/* Cell placeholder to prevent formatting issues */}
            {latestStart.diff(earliestEnd, 'days') > 0 && <div className='text-danger' style={{height: HEIGHT_EM}}>Gap in service</div>}
            <div style={{height: HEIGHT_EM}}>Version {comparedVersion.version}</div>
          </Col>
          <Col xs={9} style={{position: 'relative', height: '120px'}}>
            <FeedStartLabel
              firstDate={firstDate}
              lastDate={lastDate}
              top={0}
              versionStartDate={activeStartDate}
            />
            <FeedEndLabel
              firstDate={firstDate}
              lastDate={lastDate}
              top={0}
              versionStartDate={activeStartDate}
              versionEndDate={activeEndDate}
            />
            <FeedSpan
              firstDate={firstDate}
              lastDate={lastDate}
              isServiceGap={false}
              top={0}
              versionStartDate={activeStartDate}
              versionEndDate={activeEndDate}
            />

            {latestStart.diff(earliestEnd, 'days') > 0 &&
              <FeedSpan
                firstDate={firstDate}
                isServiceGap
                lastDate={lastDate}
                top={`${BASE_HEIGHT_EM}em`}
                versionStartDate={earliestEnd}
                versionEndDate={latestStart}
              />
            }

            <FeedStartLabel
              firstDate={firstDate}
              lastDate={lastDate}
              top={`${2 * BASE_HEIGHT_EM}em`}
              versionStartDate={comparedStartDate}
            />
            <FeedEndLabel
              firstDate={firstDate}
              lastDate={lastDate}
              top={`${2 * BASE_HEIGHT_EM}em`}
              versionStartDate={comparedStartDate}
              versionEndDate={comparedEndDate}
            />
            <FeedSpan
              firstDate={firstDate}
              lastDate={lastDate}
              isServiceGap={false}
              top={`${2 * BASE_HEIGHT_EM}em`}
              versionStartDate={comparedStartDate}
              versionEndDate={comparedEndDate}
            />
            <TodayMarker
              firstDate={firstDate}
              lastDate={lastDate}
              versionStartDate={activeStartDate}
              versionEndDate={activeEndDate}
            />
          </Col>
        </Row>
      </Grid>
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
  top,
  versionStartDate,
  versionEndDate
}) => {
  const totalDays = lastDate.diff(firstDate, 'days')
  const versionOffset = versionStartDate.diff(firstDate, 'days')
  const daysActive = versionEndDate.diff(versionStartDate, 'days')
  const relativeLength = daysActive / totalDays
  const relativeOffset = versionOffset / totalDays

  // Date labels and validity span occupy a third of the width available.
  const baseWidth = WIDTH_PIXELS / 3

  return (
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
          height: HEIGHT_EM,
          left: `${relativeOffset * baseWidth + SPAN_MARGIN_PIXELS + baseWidth}px`,
          position: 'absolute',
          top,
          width: `${relativeLength * baseWidth}px`
        }}
      >
        <span
          style={{
            backgroundColor: isServiceGap ? 'red' : 'grey',
            height: '.75em',
            position: 'absolute',
            bottom: '10%',
            width: '100%'
          }}
          title={`${daysActive} days`}

        />
      </span>
    </OverlayTrigger>
  )
}

/**
 * Renders a validity span START label (needs to be separate from the span itself for Z order).
 */
const FeedStartLabel = ({
  firstDate,
  lastDate,
  top,
  versionStartDate
}) => {
  const totalDays = lastDate.diff(firstDate, 'days')
  const versionOffset = versionStartDate.diff(firstDate, 'days')
  const relativeOffset = versionOffset / totalDays
  const startLabel = versionStartDate.format(dateFormat)

  // Date labels and validity span occupy a third of the width available.
  const baseWidth = WIDTH_PIXELS / 3

  return (
    <span style={{
      //display: 'inline-block',
      left: `${relativeOffset * baseWidth}px`,
      height: HEIGHT_EM,
      position: 'absolute',
      textAlign: 'right',
      top,
      width: `${baseWidth}px`,
      zIndex: DATE_LABEL_ZINDEX
    }}>
      {startLabel}
    </span>
  )
}

/**
 * Renders a validity span END label (needs to be separate from the span itself for Z order).
 */
const FeedEndLabel = ({
  firstDate,
  lastDate,
  top,
  versionStartDate,
  versionEndDate
}) => {
  const totalDays = lastDate.diff(firstDate, 'days')
  const versionOffset = versionStartDate.diff(firstDate, 'days')
  const daysActive = versionEndDate.diff(versionStartDate, 'days')
  const endLabel = versionEndDate.format(dateFormat)
  const relativeLength = daysActive / totalDays
  const relativeOffset = versionOffset / totalDays

  // Date labels and validity span occupy a third of the width available.
  const baseWidth = WIDTH_PIXELS / 3

  return (
    <span style={{
      left: `${relativeOffset * baseWidth + SPAN_MARGIN_PIXELS + baseWidth + relativeLength * baseWidth + SPAN_MARGIN_PIXELS}px`,
      height: HEIGHT_EM,
      position: 'absolute',
      top,
      zIndex: DATE_LABEL_ZINDEX
    }}>
      {endLabel}
    </span>
  )
}

/** Renders a marker on today's date (if one of the feeds being compared is valid). */
const TodayMarker = ({
  firstDate,
  lastDate,
  versionStartDate,
  versionEndDate
}) => {
  const totalDays = lastDate.diff(firstDate, 'days')

  const today = moment()
  const todayOffset = today.diff(firstDate, 'days')

  // Date labels and validity span occupy a third of the width available.
  const baseWidth = WIDTH_PIXELS / 3
  return (
    <div style={{
      backgroundColor: 'yellow',
      border: '1px solid #bbb',
      height: `${BASE_HEIGHT_EM * 3}em`,
      left: `${baseWidth + todayOffset / totalDays * baseWidth}px`,
      position: 'absolute',
      top: 0,
      width: '4px',
      zIndex: TODAY_LABEL_ZINDEX
    }} />
  )
}
