import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import {
  Button,
  Form,
  FormControl,
  FormGroup,
  ControlLabel
} from 'react-bootstrap'
import Select from 'react-select'

import toSentenceCase from '../../common/util/to-sentence-case'
import ExceptionDate from './ExceptionDate'
import {EXCEPTION_EXEMPLARS} from '../util'
import {getTableById} from '../util/gtfs'

export default class ScheduleExceptionForm extends Component {
  static propTypes = {
    activeEntity: PropTypes.object,
    updateActiveEntity: PropTypes.func,
    activeComponent: PropTypes.string,
    tableData: PropTypes.object,
    validationErrors: PropTypes.array
  }

  _onAddDate = () => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const dates = [...activeEntity.dates]
    dates.push(0)
    updateActiveEntity(activeEntity, activeComponent, {dates})
  }

  _filterByList = (calendars, list) => calendars
    .filter(cal => !list || list.indexOf(cal.service_id) === -1)

  _mapInput = input => input && input.length ? input.map(i => i.value) : null

  _onCalendarChange = (input, id) => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    const value = this._mapInput(input)
    updateActiveEntity(activeEntity, activeComponent, {[id]: value})
  }

  _onExemplarChange = evt => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    updateActiveEntity(activeEntity, activeComponent, {
      exemplar: +evt.target.value,
      custom_schedule: null,
      removed_service: null,
      added_service: null
    })
  }

  _onNameChange = evt => {
    const {activeComponent, activeEntity, updateActiveEntity} = this.props
    updateActiveEntity(activeEntity, activeComponent, {name: evt.target.value})
  }

  _checkValidation = id => this.props.validationErrors
    .find(e => e.field === id)
    ? 'error'
    : undefined

  render () {
    const {activeEntity, tableData} = this.props
    if (!activeEntity) return null
    const calendars = getTableById(tableData, 'calendar')
    const {
      exemplar,
      name,
      custom_schedule: customSchedule,
      added_service: addedService,
      removed_service: removedService,
      dates
    } = activeEntity
    const hasExemplar = typeof exemplar === 'number'
    return (
      <div>
        <Form>
          <FormGroup
            controlId={`name`}
            validationState={this._checkValidation('name')}
            className={`col-xs-12`}>
            <ControlLabel>
              <small>Exception name*</small>
            </ControlLabel>
            <FormControl
              value={name}
              placeholder='Thanksgiving Day'
              onChange={this._onNameChange} />
          </FormGroup>
          <FormGroup
            controlId={`schedule`}
            validationState={this._checkValidation('exemplar')}
            className={`col-xs-12`}>
            <ControlLabel>
              <small>Run the following schedule:</small>
            </ControlLabel>
            <FormControl
              componentClass='select'
              value={hasExemplar ? exemplar : ''}
              onChange={this._onExemplarChange}>
              <option value='' disabled>
                -- Select exception type --
              </option>
              {Object.keys(EXCEPTION_EXEMPLARS)
                .map(exemplar => {
                  const value = EXCEPTION_EXEMPLARS[exemplar]
                  return (
                    <option
                      value={value}
                      key={value}>
                      {value === EXCEPTION_EXEMPLARS.SWAP
                        ? 'Swap, add, or remove'
                        : toSentenceCase(exemplar)}
                    </option>
                  )
                })
              }
            </FormControl>
          </FormGroup>
          {exemplar === EXCEPTION_EXEMPLARS.CUSTOM
            ? <ExceptionCalendarSelector
              label={'Select calendar to run*'}
              id={`custom_schedule`}
              value={customSchedule}
              onChange={this._onCalendarChange}
              calendars={calendars} />
            : null
          }
          {exemplar === EXCEPTION_EXEMPLARS.SWAP
            ? (
              <div>
                <ExceptionCalendarSelector
                  label={'Select calendars to add (optional):'}
                  id={`added_service`}
                  value={addedService}
                  onChange={this._onCalendarChange}
                  calendars={this._filterByList(calendars, removedService)} />
                <ExceptionCalendarSelector
                  label={'Select calendars to remove (optional):'}
                  id={`removed_service`}
                  value={removedService}
                  onChange={this._onCalendarChange}
                  calendars={this._filterByList(calendars, addedService)} />
              </div>
            )
            : null
          }
          <FormGroup
            controlId={`exception-dates`}
            validationState={this._checkValidation('dates')}
            className={`col-xs-12`}>
            <ControlLabel>
              <small>On these dates*</small>
            </ControlLabel>
            {dates && dates.length
              ? dates.map((date, index) => (
                <ExceptionDate
                  index={index}
                  key={index}
                  date={date}
                  // Exception dates expects a boolean
                  isNotValid={Boolean(this._checkValidation(`dates-${index}`))}
                  {...this.props}
                />
              ))
              : <div>No dates specified</div>
            }
          </FormGroup>
          <div className={`col-xs-12`}>
            <Button onClick={this._onAddDate}>
              <Icon type='plus' /> Add date
            </Button>
          </div>
        </Form>
      </div>
    )
  }
}

class ExceptionCalendarSelector extends Component {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func
  }

  _onChange = input => {
    const {id, onChange} = this.props
    onChange && onChange(input, id)
  }

  _calendarToOption = calendar => ({
    value: calendar.service_id,
    label: this._getCalendarName(calendar),
    calendar
  })

  _getCalendarName = calendar => {
    let name = '[unnamed]'
    if (calendar) {
      name = calendar.description ? calendar.description : ''
      name += calendar.id ? ` (${calendar.id})` : ''
    }
    return name
  }

  render () {
    const {id, label, calendars, value} = this.props
    return (
      <FormGroup controlId={id} className={`col-xs-12`}>
        <ControlLabel><small>{label}</small></ControlLabel>
        <Select
          placeholder='Select calendar...'
          clearable
          multi
          value={value}
          onChange={this._onChange}
          options={calendars.map(this._calendarToOption)} />
      </FormGroup>
    )
  }
}
