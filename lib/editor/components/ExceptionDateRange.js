// @flow

import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'

import {updateActiveGtfsEntity} from '../actions/active'
import {modifyRangeOfDates, updateDates} from '../../common/util/exceptions'
import type {ScheduleException, ScheduleExceptionDateRange} from '../../types'

import {inputStyleProps} from './ExceptionDate'

type Props = {
  activeComponent: string,
  activeEntity: ScheduleException,
  index: number,
  isInvalid: boolean,
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
      (isStartDate && (startDate === newRangeBoundary.format('YYYYMMDD') || (isStartDate && newRangeBoundary.diff(endMoment) > 0))) ||
      (!isStartDate && (endDate === newRangeBoundary.format('YYYYMMDD') || newRangeBoundary.diff(startMoment) < 0))
    ) {
      return
    }

    // Filter out new dates (0s), add them back in later to preserve new dates in final array
    const newDates = activeEntity.dates.filter(date => typeof date === 'number')
    let dates = activeEntity.dates.filter(date => typeof date === 'string')

    // Check the updated bounds are larger than before then add or remove dates accordingly.
    // $FlowFixMe: Flow doesn't recognise array filter above.
    dates = updateDates(isStartDate, newRangeBoundary, dates, startMoment, endMoment)

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
    const deleteStart = key === 'range' ? startMoment : startMoment.add(1, 'days') // Preserve the first day if deleting only the end date

    dates = modifyRangeOfDates(dates, endMoment, deleteStart, true)

    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates: [...dates, ...newDates]}
    })
  }

  render () {
    const {range, index, isInvalid} = this.props
    const startMoment = range.startDate ? moment(range.startDate) : undefined

    const dateTimeProps = {
      defaultText: undefined,
      mode: 'date',
      size: 'sm',
      style: {
        gridColumn: 'span 5'
      }
    }

    // Highlight both inputs red if we have invalid input.
    const rangeInputStyleProps = {...inputStyleProps, backgroundColor: isInvalid ? '#FBDEDE' : undefined}

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
          data-test-id={`exception-date-range-${index}-1`} // First range input
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
          data-test-id={`exception-date-range-${index}-2`} // Second range input
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
          bsStyle='danger'
          className='pull-right '
          id={`date-remove-${index}`}
          key={`date-remove-${index}`}
          onSelect={this._onSelect}
          pullRight
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
