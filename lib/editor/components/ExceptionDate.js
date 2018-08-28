// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'

import type {ScheduleException, Entity} from '../../types'

type Props = {
  activeEntity: ScheduleException,
  date: number | string,
  isNotValid: boolean,
  updateActiveEntity: (Entity, string, any) => void,
  activeComponent: string,
  index: number
}

export default class ExceptionDate extends Component<Props> {
  _onDateChange = (millis: number) => {
    const {activeComponent, activeEntity, index, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates[index] = moment(+millis).format('YYYYMMDD')
    updateActiveEntity(activeEntity, activeComponent, {dates})
  }

  _onRemoveDate = () => {
    const {activeComponent, activeEntity, index, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates.splice(index, 1)
    updateActiveEntity(activeEntity, activeComponent, {dates: dates})
  }

  render () {
    const {date, index, isNotValid} = this.props
    const dateTimeProps = {
      mode: 'date',
      dateTime: date ? +moment(date) : +moment(),
      onChange: this._onDateChange,
      defaultText: undefined
    }
    if (!date) {
      dateTimeProps.defaultText = 'Please select a date'
    }
    return (
      <div
        key={index}
        style={{position: 'relative', width: '100%', marginBottom: '5px'}}>
        <Button
          bsStyle='danger'
          className='pull-right'
          style={{marginLeft: '5px'}}
          key={`date-remove-${index}`}
          onClick={this._onRemoveDate}>
          <Icon type='times' />
        </Button>
        <DateTimeField
          key={`date-${index}`}
          mode='date'
          {...dateTimeProps} />
        {isNotValid && date
          ? <small>
            {moment(date).format('MM/DD/YYYY')} appears in another schedule exception. Please choose another date.
          </small>
          : null
        }
      </div>
    )
  }
}
