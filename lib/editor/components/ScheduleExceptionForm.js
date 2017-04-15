import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Button, Form, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import Select from 'react-select'
import moment from 'moment'

import ExceptionDate from './ExceptionDate'
import { EXEMPLARS } from '../util'
import toSentenceCase from '../../common/util/to-sentence-case'

export default class ScheduleExceptionForm extends Component {
  static propTypes = {
    activeEntity: PropTypes.object,
    updateActiveEntity: PropTypes.func,
    activeComponent: PropTypes.string,
    tableData: PropTypes.object,
    validate: PropTypes.func
  }

  _onAddDate = () => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates.push(0)
    updateActiveEntity(activeEntity, activeComponent, {dates: dates})
  }

  _onAddedServiceChange = (input) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const val = input ? input.map(i => i.value) : null
    updateActiveEntity(activeEntity, activeComponent, {addedService: val})
  }

  _onCustomScheduleChange = (input) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const val = input ? input.map(i => i.value) : null
    updateActiveEntity(activeEntity, activeComponent, {customSchedule: val})
  }

  _onExemplarChange = (evt) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    updateActiveEntity(activeEntity, activeComponent, {exemplar: evt.target.value, customSchedule: null})
  }

  _onNameChange = (evt) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    updateActiveEntity(activeEntity, activeComponent, {name: evt.target.value})
  }

  _onRemovedServiceChange = (input) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const val = input ? input.map(i => i.value) : null
    updateActiveEntity(activeEntity, activeComponent, {removedService: val})
  }

  calendarToOption = calendar => ({
    value: calendar.id,
    label: calendar.description,
    calendar
  })

  render () {
    const {
      activeEntity,
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
              onChange={this._onNameChange} />
          </FormGroup>
          <FormGroup
            controlId={`schedule`}
            className={`col-xs-12`}>
            <ControlLabel>Run the following schedule:</ControlLabel>
            <FormControl componentClass='select'
              value={activeEntity && activeEntity.exemplar}
              onChange={this._onExemplarChange}>
              {EXEMPLARS.map(exemplar => {
                return (
                  <option value={exemplar} key={exemplar}>
                    {exemplar === 'SWAP'
                      ? 'Swap, add, or remove'
                      : toSentenceCase(exemplar)
                    }
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
                onChange={this._onCustomScheduleChange}
                options={tableData.calendar
                  ? tableData.calendar.map(this.calendarToOption)
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
              <ControlLabel>Select calendars to add (optional):</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={activeEntity && activeEntity.addedService}
                onChange={this._onAddedServiceChange}
                options={tableData.calendar
                  ? tableData.calendar
                    .filter(cal => !activeEntity.removedService || activeEntity.removedService.indexOf(cal.id) === -1)
                    .map(this.calendarToOption)
                  : []
              } />
              <ControlLabel>Select calendars to remove (optional):</ControlLabel>
              <Select
                placeholder='Select calendar...'
                clearable
                multi
                value={activeEntity && activeEntity.removedService}
                onChange={this._onRemovedServiceChange}
                options={tableData.calendar
                  ? tableData.calendar
                    .filter(cal => !activeEntity.addedService || activeEntity.addedService.indexOf(cal.id) === -1)
                    .map(this.calendarToOption)
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
              ? activeEntity.dates.map((date, index) => (
                <ExceptionDate
                  index={index}
                  key={index}
                  date={date}
                  dateMap={dateMap}
                  {...this.props} />
              )
            )
          : <div>No dates specified</div>
        }
          </FormGroup>
          <div className={`col-xs-12`}>
            <Button
              onClick={this._onAddDate}>
              <Icon type='plus' /> Add date
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}
