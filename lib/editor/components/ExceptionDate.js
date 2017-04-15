import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import DateTimeField from 'react-bootstrap-datetimepicker'
import moment from 'moment'

export default class ExceptionDate extends Component {

  static propTypes = {
    activeEntity: PropTypes.object,
    updateActiveEntity: PropTypes.func,
    activeComponent: PropTypes.string,
    index: PropTypes.number,
    tableData: PropTypes.object,
    validate: PropTypes.func
  }

  _onDateChange = (millis) => {
    const {activeComponent, activeEntity, index, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates[index] = +millis
    updateActiveEntity(activeEntity, activeComponent, {dates})
  }

  _onRemoveDate = () => {
    const {activeComponent, activeEntity, index, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates.splice(index, 1)
    updateActiveEntity(activeEntity, activeComponent, {dates: dates})
  }

  render () {
    const {date, dateMap, index, validate} = this.props
    let isNotValid = false
    const dateString = moment(+date).format('YYYYMMDD')
    // check if date already exists in this or other exceptions
    if (dateMap[dateString] && dateMap[dateString].length > 1) {
      validate({field: `dates-${index}`, invalid: true})
      isNotValid = true
    }
    const dateTimeProps = {
      mode: 'date',
      dateTime: date ? +moment(date) : +moment(),
      onChange: this._onDateChange
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
          onClick={this._onRemoveDate}
        ><Icon type='times' /></Button>
        {/*
          <DatePicker
          // selected={this.state.startDate}
          // onChange={this.handleChange}
          className='form-control'
          {...dateTimeProps}
          isClearable={true}
          placeholderText="I have been cleared!" />
        */}
        <DateTimeField key={`date-${index}`} mode='date' {...dateTimeProps} />
        {isNotValid
          ? <small>
            {moment(+date).format('MM/DD/YYYY')} appears in another schedule exception. Please choose another date.
          </small>
          : null
        }
      </div>
    )
  }
}
