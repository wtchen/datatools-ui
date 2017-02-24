import React, {Component, PropTypes} from 'react'
import { Button, Form, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import Select from 'react-select'
import moment from 'moment'
import {Icon} from '@conveyal/woonerf'
import { sentence as toSentenceCase } from 'change-case'
import DateTimeField from 'react-bootstrap-datetimepicker'

import { EXEMPLARS } from '../util'

export default class ScheduleExceptionForm extends Component {
  static propTypes = {
    activeEntity: PropTypes.object,
    updateActiveEntity: PropTypes.func,
    activeComponent: PropTypes.string,
    tableData: PropTypes.object
  }
  render () {
    const {
      activeEntity,
      updateActiveEntity,
      activeComponent,
      tableData,
      validate
    } = this.props
    const dateMap = {}
    let allExceptions = []
    if (this.props.tableData.scheduleexception) {
      allExceptions = [...this.props.tableData.scheduleexception]
    }
    if (this.props.activeEntity) {
      const exceptionIndex = allExceptions.findIndex(se => se.id === this.props.activeEntity.id)
      if (exceptionIndex !== -1) {
        allExceptions.splice(exceptionIndex, 1)
      }
      allExceptions.push(this.props.activeEntity)
    }
    for (let i = 0; i < allExceptions.length; i++) {
      allExceptions[i].dates && allExceptions[i].dates.map(d => {
        if (typeof dateMap[moment(d).format('YYYYMMDD')] === 'undefined') {
          dateMap[moment(d).format('YYYYMMDD')] = []
        }
        dateMap[moment(d).format('YYYYMMDD')].push(allExceptions[i].id)
      })
    }
    activeEntity && activeEntity.dates.length === 0 && validate({field: 'dates', invalid: true})
    return (
      <div>
        <Form>
          <FormGroup
            controlId={`name`}
            className={`col-xs-12`}>
            <ControlLabel>Exception name</ControlLabel>
            <FormControl
              value={activeEntity && activeEntity.name}
              onChange={(evt) => {
                updateActiveEntity(activeEntity, activeComponent, {name: evt.target.value})
              }} />
          </FormGroup>
          <FormGroup
            controlId={`schedule`}
            className={`col-xs-12`}>
            <ControlLabel>Run the following schedule:</ControlLabel>
            <FormControl componentClass='select'
              value={activeEntity && activeEntity.exemplar}
              onChange={(evt) => {
                // const props = {}
                // props[field.name] = evt.target.value
                updateActiveEntity(activeEntity, activeComponent, {exemplar: evt.target.value, customSchedule: null})
              }}>
              {EXEMPLARS.map(exemplar => {
                return (
                  <option value={exemplar} key={exemplar}>
                    {toSentenceCase(exemplar)}
                  </option>
                )
              })}
            </FormControl>
          </FormGroup>
          {activeEntity && activeEntity.exemplar === 'CUSTOM'
            ? <FormGroup
              controlId={`custom`}
              className={`col-xs-12`}>
              <ControlLabel>Select calendar to run:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={activeEntity && activeEntity.customSchedule}
                onChange={(input) => {
                  console.log(input)
                  const val = input ? input.map(i => i.value) : null
                  updateActiveEntity(activeEntity, activeComponent, {customSchedule: val})
                }}
                options={tableData.calendar
                  ? tableData.calendar.map(calendar => {
                    return {
                      value: calendar.id,
                      label: calendar.description,
                      calendar
                    }
                  })
                  : []
                }
                />
            </FormGroup>
            : null
          }
          {activeEntity && activeEntity.exemplar === 'SWAP'
            ? <FormGroup
              controlId={`custom`}
              className={`col-xs-12`}>
              <ControlLabel>Select calendars to add:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={activeEntity && activeEntity.addedService}
                onChange={(input) => {
                  const val = input ? input.map(i => i.value) : null
                  updateActiveEntity(activeEntity, activeComponent, {addedService: val})
                }}
                options={tableData.calendar
                  ? tableData.calendar
                    .filter(cal => !activeEntity.removedService || activeEntity.removedService.indexOf(cal.id) === -1)
                    .map(calendar => {
                      return {
                        value: calendar.id,
                        label: calendar.description,
                        calendar
                      }
                    })
                  : []
              } />
              <ControlLabel>Select calendars to remove:</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={activeEntity && activeEntity.removedService}
                onChange={(input) => {
                  console.log(input)
                  const val = input ? input.map(i => i.value) : null
                  updateActiveEntity(activeEntity, activeComponent, {removedService: val})
                }}
                options={tableData.calendar
                  ? tableData.calendar
                    .filter(cal => !activeEntity.addedService || activeEntity.addedService.indexOf(cal.id) === -1)
                    .map(calendar => {
                      return {
                        value: calendar.id,
                        label: calendar.description,
                        calendar
                      }
                    })
                  : []
              } />
            </FormGroup>
            : null
          }
          <FormGroup
            controlId={`exception-dates`}
            className={`col-xs-12`}>
            <ControlLabel>On these dates:</ControlLabel>
            {activeEntity && activeEntity.dates.length
              ? activeEntity.dates.map((date, index) => {
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
                  onChange: (millis) => {
                    const dates = [...activeEntity.dates]
                    dates[index] = +millis
                    updateActiveEntity(activeEntity, activeComponent, {dates})
                  }
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
                      onClick={() => {
                        const dates = [...activeEntity.dates]
                        dates.splice(index, 1)
                        updateActiveEntity(activeEntity, activeComponent, {dates: dates})
                      }}
                    ><Icon type='times' /></Button>
                    <DateTimeField key={`date-${index}`} mode='date' {...dateTimeProps} />
                    {isNotValid
                      ? <small>{moment(+date).format('MM/DD/YYYY')} appears in another schedule exception. Please choose another date.</small>
                      : null
                    }
                  </div>
                )
              }
            )
          : <div>No dates specified</div>
        }
          </FormGroup>
          <div className={`col-xs-12`}>
            <Button
              onClick={() => {
                const dates = [...activeEntity.dates]
                dates.push(0)
                updateActiveEntity(activeEntity, activeComponent, {dates: dates})
              }}
            ><Icon type='plus' /> Add date</Button>
          </div>
        </Form>
      </div>
    )
  }
}
