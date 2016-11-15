import React, {Component, PropTypes} from 'react'
import { InputGroup, Col, Row, Checkbox, Label, Button, Form, OverlayTrigger, Tooltip, ButtonGroup } from 'react-bootstrap'
import truncate from 'truncate'
import {Icon} from '@conveyal/woonerf'
import Select from 'react-select'

import HourMinuteInput from './HourMinuteInput'
import { getEntityName } from '../util/gtfs'

export default class TimetableHeader extends Component {
  static propTypes = {
    feedSource: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {
      selected: this.props.selected,
      edited: this.props.edited
    }
  }
  render () {
    const { feedSource, route, tableData, activeScheduleId, activePattern, setActiveEntity, fetchTripsForCalendar } = this.props
    const calendars = tableData.calendar || []
    const activeCalendar = calendars.find(c => c.id === activeScheduleId)
    const headerStyle = {
      backgroundColor: 'white'
    }
    const tableType = activePattern && activePattern.useFrequency
      ? 'Frequency editor'
      : 'Timetable editor'
    const patternName = activePattern && activePattern.name
    const calendarName = activeCalendar && activeCalendar.service_id
    return (
      <div
        className='timetable-header'
        style={headerStyle}
      >
        <Row style={{marginTop: '20px'}}>
          <Col sm={3}>
            <h3 style={{margin: '0px'}}>
              <OverlayTrigger overlay={<Tooltip id='back-to-route'>Back to route</Tooltip>}>
                <Button
                  style={{marginTop: '-5px'}}
                  onClick={() => {
                    setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern)
                  }}
                ><Icon type='reply' />
                </Button>
              </OverlayTrigger>
              <span style={{marginLeft: '10px'}}><Icon type='calendar' /> {tableType}</span>
            </h3>
          </Col>
          <Col sm={6}>
            <h4 style={{margin: '0px', marginTop: '5px'}}>
              {this.props.data.length} trips for <span title={patternName}>{truncate(patternName, 15)}</span> on <span title={calendarName}>{truncate(calendarName, 13)}</span> calendar
            </h4>
          </Col>
          <Col sm={3}>
            <Form
              inline
              className='pull-right'
            >
              {activePattern && !activePattern.useFrequency
                ? <Checkbox
                  value={this.props.timetable.hideDepartureTimes}
                  onChange={(evt) => {
                    this.props.toggleDepartureTimes()
                  }}
                >
                  <small> Hide departures</small>
                </Checkbox>
                : null
              }
              {'  '}
              <InputGroup>
                <HourMinuteInput
                  ref='offsetInput'
                  style={{width: '65px'}}
                  onChange={(seconds) => {
                    this.props.setOffset(seconds)
                  }}
                />
                  <InputGroup.Button>
                    <Button
                      // disabled={this.props.selected.length === 0}
                      onClick={() => {
                        if (this.props.selected.length > 0) {
                          this.props.offsetRows(this.props.selected, this.props.timetable.offset)
                        }
                        // if no rows selected, offset last row
                        else {
                          this.props.offsetRows([this.props.timetable.trips.length - 1], this.props.timetable.offset)
                        }

                      }}
                    >
                      Offset
                    </Button>
                  </InputGroup.Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>
        <Row style={{marginTop: '5px', marginBottom: '5px'}}>
          <Col xs={12} sm={3}>
            <RouteSelect
              feedSource={feedSource}
              route={route}
              routes={tableData.route}
              setActiveEntity={setActiveEntity}
            />
          </Col>
          <Col xs={12} sm={3}>
            <PatternSelect
              feedSource={feedSource}
              route={route}
              activePattern={activePattern}
              setActiveEntity={setActiveEntity}
            />
          </Col>
          <Col xs={12} sm={3}>
            <CalendarSelect
              activePattern={activePattern}
              route={route}
              feedSource={feedSource}
              activeCalendar={activeCalendar}
              calendars={calendars}
              setActiveEntity={setActiveEntity}
              trips={this.props.data}
            />
          </Col>
          <Col sm={3}>
            <ButtonGroup
              className='pull-right'
            >
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-add'>Add new trip</Tooltip>}>
                <Button
                  onClick={() => this.props.addNewRow(false, true)}
                  bsStyle='default'
                >
                  <Icon type='plus' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-duplicate'>Duplicate trips</Tooltip>}>
                <Button
                  disabled={this.props.selected.length === 0}
                >
                  <Icon type='clone' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-delete'>Delete trips</Tooltip>}>
                <Button
                  disabled={this.props.selected.length === 0}
                  onClick={() => {
                    this.props.removeSelectedRows()
                  }}
                  bsStyle='danger'
                >
                  <Icon type='trash' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-undo'>Undo changes</Tooltip>}>
                <Button
                  disabled={this.props.timetable.edited.length === 0}
                  onClick={(e) => {
                    fetchTripsForCalendar(feedSource.id, activePattern, activeCalendar.id)
                    // setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', activeCalendar)
                  }}
                >
                  <Icon type='undo' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-save'>Save changes</Tooltip>}>
                <Button
                  disabled={this.props.timetable.edited.length === 0}
                  onClick={() => {
                    this.props.saveEditedTrips(activePattern, activeScheduleId)
                  }}
                  bsStyle='primary'
                >
                  <Icon type='floppy-o' />
                </Button>
              </OverlayTrigger>
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    )
  }
}

class RouteSelect extends Component {
  _render = (option) => {
    return (
      <span title={option.label}>
        <Icon type='bus' /> {truncate(option.label, 23)}
        {' '}
        <Label title={`Route has ${option.routeTrips} trips`}><Icon type='bars' /> {option.routeTrips}</Label>
      </span>
    )
  }
  render () {
    const { route, routes, feedSource, setActiveEntity } = this.props
    return (
      <Select
        value={route && route.id}
        component={'route'}
        valueRenderer={this._render}
        optionRenderer={this._render}
        placeholder={<span><Icon type='bus' /> Select route...</span>}
        options={routes && routes.map(route => ({value: route.id, label: `${getEntityName('route', route)}` || '[Unnamed]', route, routeTrips: route.numberOfTrips}))}
        clearable={false}
        entities={routes}
        onChange={(value) => {
          const patt = {id: 'new'}
          setActiveEntity(feedSource.id, 'route', value.route, 'trippattern', patt, 'timetable', null)
        }}
      />
    )
  }
}

class PatternSelect extends Component {
  _render = (option) => {
    const calendarCount = Object.keys(option.pattern.tripCountByCalendar).length
    return (
      <span title={option.label}>
        <Icon type='code-fork' /> {option.label}
        {' '}
        <Label
          title={`Pattern has ${option.pattern.numberOfTrips} trips`}
        ><Icon type='bars' /> {option.pattern.numberOfTrips}</Label>
        {' '}
        <Label
          title={`Pattern has trips for ${calendarCount} calendars`}
        ><Icon type='calendar-o' /> {calendarCount}</Label>
      </span>
    )
  }
  render () {
    const { activePattern, route, feedSource, setActiveEntity } = this.props
    const patterns = route && route.tripPatterns ? route.tripPatterns : []
    return (
      <Select
        value={activePattern && activePattern.id}
        component={'pattern'}
        valueRenderer={this._render}
        optionRenderer={this._render}
        placeholder={<span><Icon type='code-fork' /> Select pattern...</span>}
        options={patterns.map(pattern => ({value: pattern.id, label: `${getEntityName('pattern', pattern)}` || '[Unnamed]', pattern}))}
        onChange={(value) => {
          const pattern = value && value.pattern || {id: 'new'}
          setActiveEntity(feedSource.id, 'route', route, 'trippattern', pattern, 'timetable', null)
        }}
      />
    )
  }
}

class CalendarSelect extends Component {
  _render = (option) => {
    const patternTrips = this.props.activePattern && this.props.activePattern.tripCountByCalendar[option.value] || 0
    const routeCount = Object.keys(option.calendar.routes).length
    return (
      <span title={`${option.label} (${option.service_id})`}>
        <Icon type='calendar-o' /> {option.label}
        {' '}
        <Label
          bsStyle={patternTrips ? 'success' : 'default'}
          title={`Calendar has ${patternTrips} trips for pattern and ${option.routeTrips} for route`}
        ><Icon type='bars' /> {patternTrips}/{option.routeTrips}</Label>
        {' '}
        <Label
          title={`Calendar has trips for ${routeCount} routes`}
        ><Icon type='bus' /> {routeCount}</Label>
        {' '}
        <Label
          title={`Calendar has ${option.totalTrips} trips for feed`}
        ><Icon type='building-o' /> {option.totalTrips}</Label>
      </span>
    )
  }
  render () {
    const { activePattern, route, feedSource, activeCalendar, calendars, setActiveEntity, trips } = this.props
    const options = calendars && route
      ? calendars.sort((a, b) => {
        if (route.id in a.routes && !(route.id in b.routes)) return -1
        else if (route.id in b.routes && !(route.id in a.routes)) return 1
        else return b.numberOfTrips - a.numberOfTrips
      }).map(calendar => {
        return {
          label: calendar.description,
          value: calendar.id,
          service_id: calendar.service_id,
          calendar,
          totalTrips: calendar.numberOfTrips,
          routeTrips: calendar.routes[route.id] || 0,
          calendarTrips: trips.length
        }
      })
      : []
    return (
      <Select
        value={activeCalendar && activeCalendar.id}
        placeholder={<span><Icon type='calendar-o' /> Select calendar...</span>}
        valueRenderer={this._render}
        optionRenderer={this._render}
        disabled={!activePattern || activePattern.id === 'new'}
        options={options}
        onChange={(value) => {
          const calendar = value && value.calendar
          setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', calendar)
        }}
        filterOptions
      />
    )
  }
}
