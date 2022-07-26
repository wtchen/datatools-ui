// @flow

import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'

import {updateActiveGtfsEntity} from '../actions/active'
import {addRangeOfDates, removeRangeOfDates} from '../../common/util/exceptions'
import type {ScheduleException, ScheduleExceptionDateRange} from '../../types'

import {inputStyleProps} from './ExceptionDate'

type Props = {
  activeComponent: string,
  activeEntity: ScheduleException,
  index: number,
  isNotValid: boolean,
  range: ScheduleExceptionDateRange,
  updateActiveGtfsEntity: typeof updateActiveGtfsEntity
}

export default class ExceptionDateRange extends Component<Props> {
  // This is kept as an arrow function in order to access the component's `this`
  _onRangeUpdate = (millis: number, isStartDate: boolean) => {
    const {activeComponent, activeEntity, range, updateActiveGtfsEntity} = this.props
    const {endDate, startDate} = range

    const newRangeBoundary = moment(+millis)
    const startMoment = moment(startDate)
    const endMoment = moment(endDate)

    // This prevents the user from inputting invalid data. Validation is not required since this behaviour
    // is fully prevented (see also use of minDate and maxDate in DateTimePickers)
    if (
      (isStartDate && startDate === newRangeBoundary.format('YYYYMMDD')) ||
      (!isStartDate && endDate === newRangeBoundary.format('YYYYMMDD'))
    ) {
      return
    } else if (
      (isStartDate && newRangeBoundary.diff(endMoment) > 0) ||
      (!isStartDate && newRangeBoundary.diff(startMoment) < 0)
    ) {
      return
    }

    // Filter out new dates (0s), add them back in later to preserve new dates in final array
    const newDates = activeEntity.dates.filter(date => typeof date === 'number')
    // $FlowFixMe Flow does not recognize filtering on typeof
    let dates = ((activeEntity.dates.filter(date => typeof date === 'string') || []): Array<string>)

    // Check the updated bounds are larger than before then add or remove dates accordingly.
    if (isStartDate) {
      const rangeExtended = startMoment.diff(newRangeBoundary) > 0
      dates = rangeExtended
        ? addRangeOfDates(newRangeBoundary, startMoment, dates, true, false)
        : removeRangeOfDates(startMoment, newRangeBoundary, dates, true, false)
    } else {
      const rangeExtended = newRangeBoundary.diff(endMoment) > 0
      dates = rangeExtended
        ? addRangeOfDates(endMoment, newRangeBoundary, dates, false, true)
        : removeRangeOfDates(newRangeBoundary, endMoment, dates, false, true)
    }

    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates: [...dates, ...newDates]}
    })
  }

  _onSelect = (key: string) => {
    const {activeComponent, activeEntity, range, updateActiveGtfsEntity} = this.props
    let dates = [...activeEntity.dates]

    const newDates = activeEntity.dates.filter(date => typeof date === 'number')
    // $FlowFixMe Flow does not recognize filtering on typeof
    dates = (dates.filter(date => typeof date === 'string'): Array<string>)

    const startMoment = moment(range.startDate)
    const endMoment = moment(range.endDate)

    if (key === 'range') {
      dates = removeRangeOfDates(startMoment, endMoment, dates, true, true)
    } else if (key === 'end-date') {
      dates = removeRangeOfDates(startMoment, endMoment, dates, false, true)
    }

    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates: [...dates, ...newDates]}
    })
  }

  render () {
    const {range, index, isNotValid} = this.props

    const dateTimeProps = {
      defaultText: undefined,
      mode: 'date',
      size: 'sm',
      style: {
        gridColumn: 'span 5'
      }
    }

    const startMoment = range.startDate ? moment(range.startDate) : undefined
    // Highlight both inputs red if we have invalid input.
    const rangeInputStyleProps = {...inputStyleProps, backgroundColor: isNotValid ? '#FBDEDE' : undefined}

    return (
      <div
        key={index}
        style={{
          display: 'grid',
          gridGap: '5px',
          gridTemplateColumns: 'repeat(12, 1fr)',
          marginBottom: '5px'
        }}
      >
        <div
          style={{gridColumn: 'span 5'}}
        >
          <DateTimeField
            className='date-range'
            dateTime={startMoment}
            inputProps={{style: rangeInputStyleProps}}
            key={`date-${index}-start`}
            // The maxDate API subtracts a day from the maxDate, see:
            // https://github.com/quri/react-bootstrap-datetimepicker/commit/eb5f700267d0cf945abfdac3a4f7ca879b314e70
            maxDate={moment(range.endDate).subtract(1, 'day')}
            onChange={(millis) => this._onRangeUpdate(millis, true)}
            {...dateTimeProps}
          />
        </div>
        <i className='fa fa-minus' style={{gridColumn: 'span 1', placeSelf: 'center '}} />
        <div
          style={{gridColumn: 'span 5'}}
        >
          <DateTimeField
            className='date-range'
            dateTime={range.endDate ? +moment(range.endDate) : +moment(range.startDate).add(1, 'days')}
            inputProps={{style: rangeInputStyleProps}}
            key={`date-${index}-end`}
            minDate={startMoment && startMoment.clone().startOf('day').add(2, 'days')} // See above, minDate subtracts an extra day.
            onChange={(millis) => this._onRangeUpdate(millis, false)}
            {...dateTimeProps}
          />
        </div>
        <DropdownButton
          pullRight
          bsStyle='danger'
          className='pull-right '
          id={`date-remove-${index}`}
          key={`date-remove-${index}`}
          onSelect={this._onSelect}
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: '2',
            gridColumn: 'span 1',
            height: '100%',
            placeSelf: 'center',
            padding: '6px'
          }}
          title={<i className='fa fa-times' />}
        >
          <MenuItem eventKey='range'>Delete range</MenuItem>
          <MenuItem eventKey='end-date'>Delete end date</MenuItem>
        </DropdownButton>
      </div>
    )
  }
}
