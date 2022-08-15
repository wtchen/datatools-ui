// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'
import {toast} from 'react-toastify'

import {updateActiveGtfsEntity} from '../actions/active'
import type {ScheduleException} from '../../types'

type Props = {
  activeComponent: string,
  activeEntity: ScheduleException,
  date: number | string,
  index: number,
  isInvalid: boolean,
  updateActiveGtfsEntity: typeof updateActiveGtfsEntity
}

type State = {
    isDeleted: boolean,
    isDuplicate: boolean
}

export const inputStyleProps = {
  padding: 0,
  textAlign: 'center'
}

export default class ExceptionDate extends Component<Props, State> {
  _addRange = () => {
    const {activeComponent, activeEntity, index, updateActiveGtfsEntity} = this.props
    const dates = [...activeEntity.dates]

    const currentDate = dates[index]

    // A default range of 1 day is created
    dates.push(moment(currentDate).add(1, 'days').format('YYYYMMDD'))

    dates.sort((a, b) => moment(a).diff(moment(b))) // Sort before update for maintaining indices
    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates}
    })
  }

  _onDateChange = (millis: number) => {
    const {activeComponent, activeEntity, index, updateActiveGtfsEntity} = this.props
    const dates = [...activeEntity.dates]
    const newDate = moment(+millis).format('YYYYMMDD')

    // Check if the date selected is already in an existing range.
    // Invalid date results from typing in the Datetimepicker component (which is valid as long as it resolves to a date)
    if (dates.some(date => date === newDate && date !== 'Invalid date')) {
      dates.splice(index, 1)
      toast.warn(
        `ⓘ Date has been removed. Date entered is already included in an existing range or single date!`,
        {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        }
      )
    } else dates[index] = newDate

    dates.sort((a, b) => moment(a).diff(moment(b)))
    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates}
    })
  }

  _onRemoveDate = () => {
    const {activeComponent, activeEntity, index, updateActiveGtfsEntity} = this.props
    const dates = [...activeEntity.dates]
    dates.splice(index, 1)
    updateActiveGtfsEntity({
      component: activeComponent,
      entity: activeEntity,
      props: {dates: dates}
    })
  }

  render () {
    const {date, index, isInvalid} = this.props
    const dateTimeProps = {
      mode: 'date',
      dateTime: date ? +moment(date) : undefined,
      onChange: this._onDateChange,
      defaultText: undefined,
      size: 'sm'
    }

    if (!date) {
      dateTimeProps.defaultText = 'Select date'
    }
    return (
      <div
        key={index}
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: 5,
          gridTemplateColumns: 'repeat(12, 1fr)',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          marginBottom: '5px'
        }}>
        <div
          style={{gridColumn: '1 / 6'}}
        >
          <DateTimeField
            inputProps={{style: {...inputStyleProps, backgroundColor: isInvalid ? '#FBDEDE' : undefined}}}
            key={`date-${index}`}
            mode='date'
            {...dateTimeProps}
          />
        </div>

        <Button
          data-test-id='exception-add-range'
          disabled={!date}
          onClick={this._addRange}
          size='sm'
          style={{
            height: '100%',
            textAlign: 'center',
            gridColumn: '7 / 12',
            lineHeight: 0,
            fontSize: 'x-small',
            padding: '4',
            margin: 0,
            width: '100%'
          }}
        >
          Add range
        </Button>
        <Button
          bsStyle='danger'
          className='pull-right'
          style={{
            alignSelf: 'center',
            gridColumn: '12',
            height: '100%',
            justifySelf: 'center',
            padding: '2px 7.5px'
          }}
          key={`date-remove-${index}`}
          onClick={this._onRemoveDate}>
          <Icon type='times' />
        </Button>
        {isInvalid && date
          ? <small style={{gridColumn: 'span 12'}}>
            {moment(date).format('MM/DD/YYYY')} appears in another schedule exception. Please choose another date.
          </small>
          : null
        }
      </div>
    )
  }
}
