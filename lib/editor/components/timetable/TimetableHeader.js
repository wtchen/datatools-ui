import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { InputGroup, Col, Row, Checkbox, Button, Form, OverlayTrigger, Tooltip, ButtonGroup } from 'react-bootstrap'
import truncate from 'truncate'

import HourMinuteInput from '../HourMinuteInput'
import CalendarSelect from './CalendarSelect'
import RouteSelect from './RouteSelect'
import PatternSelect from './PatternSelect'
import {getConfigProperty} from '../../../common/util/config'
import {getTableById} from '../../util/gtfs'

export default class TimetableHeader extends Component {
  static propTypes = {
    feedSource: PropTypes.object,
    fetchCalendarTripCountsForPattern: PropTypes.func,
    timetable: PropTypes.object,
    setOffset: PropTypes.func,
    offsetRows: PropTypes.func,
    toggleDepartureTimes: PropTypes.func,
    addNewRow: PropTypes.func,
    removeSelectedRows: PropTypes.func,
    saveEditedTrips: PropTypes.func,
    route: PropTypes.object,
    tableData: PropTypes.object,
    activeScheduleId: PropTypes.string,
    activePattern: PropTypes.object,
    setActiveEntity: PropTypes.func,
    fetchTripsForCalendar: PropTypes.func,
    duplicateRows: PropTypes.func
  }

  _onClickAdd = () => this.props.addNewRow(true, true)

  _onClickClone = () => {
    const {duplicateRows, timetable} = this.props
    const {selected, trips} = timetable
    // if no rows selected, duplicate last
    // TODO: should this duplicate row in which cursor lies?
    if (selected.length === 0) {
      duplicateRows([trips.length - 1])
    } else {
      duplicateRows(selected)
    }
  }

  _onClickBack = () => {
    const {activePattern, feedSource, route, setActiveEntity} = this.props
    setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern)
  }

  _onClickUndoButton = (e) => {
    const {activePattern, activeScheduleId, feedSource, fetchTripsForCalendar, tableData} = this.props
    const calendars = getTableById(tableData, 'calendar')
    const activeCalendar = calendars.find(c => c.service_id === activeScheduleId)
    fetchTripsForCalendar(feedSource.id, activePattern, activeCalendar.service_id)
  }

  _onClickSave = () => {
    const {activePattern, activeScheduleId, saveEditedTrips} = this.props
    saveEditedTrips(activePattern, activeScheduleId)
  }

  _onClickOffset = () => {
    const {offsetRows, timetable} = this.props
    const {selected, trips, offset} = timetable
    if (selected.length > 0) {
      offsetRows({rowIndexes: selected, offset})
    } else {
      // if no rows selected, offset last row
      offsetRows({rowIndexes: [trips.length - 1], offset})
    }
  }

  render () {
    const {
      feedSource,
      fetchCalendarTripCountsForPattern,
      timetable,
      setOffset,
      toggleDepartureTimes,
      removeSelectedRows,
      route,
      tableData,
      activeScheduleId,
      activePattern,
      setActiveEntity,
      tripCounts
    } = this.props
    const {selected, trips, hideDepartureTimes, edited} = timetable
    const calendars = getTableById(tableData, 'calendar')
    const activeCalendar = calendars.find(c => c.service_id === activeScheduleId)
    const headerStyle = {
      backgroundColor: 'white'
    }
    const tableType = activePattern && activePattern.useFrequency
      ? 'Frequency editor'
      : 'Timetable editor'
    const patternName = activePattern && activePattern.name
    const calendarName = activeCalendar && activeCalendar.service_id
    const numberOfTrips = !activePattern || !activeCalendar
      ? 0
      : trips
        ? trips.length
        : 0
    const buttons = [{
      id: 'add',
      tooltip: 'Add blank trip',
      props: {
        onClick: this._onClickAdd,
        children: <Icon type='plus' />
      }
    }, {
      id: 'duplicate',
      tooltip: 'Duplicate trips',
      props: {
        children: <Icon type='clone' />,
        'data-test-id': 'duplicate-trip-button',
        onClick: this._onClickClone
      }
    }, {
      id: 'delete',
      tooltip: 'Delete trips',
      props: {
        bsStyle: 'danger',
        children: <Icon type='trash' />,
        'data-test-id': 'delete-trip-button',
        disabled: selected.length === 0,
        onClick: removeSelectedRows
      }
    }, {
      id: 'undo',
      tooltip: 'Undo changes',
      props: {
        disabled: edited.length === 0,
        onClick: this._onClickUndoButton,
        children: <Icon type='undo' />
      }
    }, {
      id: 'save',
      tooltip: 'Save changes',
      props: {
        bsStyle: 'primary',
        'data-test-id': 'save-trip-button',
        children: <Icon type='floppy-o' />,
        disabled: edited.length === 0,
        onClick: this._onClickSave
      }
    }]
    return (
      <div
        className='timetable-header'
        style={headerStyle}>
        <Row style={{marginTop: '20px'}}>
          <Col sm={3}>
            <h3 style={{margin: '0px'}}>
              {/* Back button */}
              <OverlayTrigger overlay={<Tooltip id='back-to-route'>Back to route</Tooltip>}>
                <Button
                  bsSize='small'
                  style={{marginTop: '-5px'}}
                  onClick={this._onClickBack}>
                  <Icon type='reply' />
                </Button>
              </OverlayTrigger>
              <span style={{marginLeft: '10px'}}><Icon type='calendar' /> {tableType}</span>
            </h3>
          </Col>
          <Col sm={6}>
            {/* title, etc. */}
            <h4 style={{margin: '0px', marginTop: '5px'}}>
              {numberOfTrips} trips for{' '}
              <span title={patternName}>
                {patternName ? `${truncate(patternName, 15)} on ` : '[select pattern]'}
              </span>
              <span title={calendarName}>
                {patternName && !calendarName
                  ? '[select calendar]'
                  : !patternName
                    ? ''
                    : `${truncate(calendarName, 13)} calendar`}
              </span>
            </h4>
          </Col>
          <Col sm={3}>
            <Form
              inline
              className='pull-right'>
              {/* Hide departures check */}
              {activePattern && !activePattern.useFrequency && getConfigProperty('application.dev')
                ? <Checkbox
                  value={hideDepartureTimes}
                  onChange={toggleDepartureTimes}>
                  <OverlayTrigger
                    placement='bottom'
                    overlay={
                      <Tooltip id='hide-departures-check'>
                        Hiding departure times will keep arrival and departure{' '}
                        times in sync. WARNING: do not use if arrivals and{' '}
                        departures differ.
                      </Tooltip>
                    }>
                    <small> Hide departures</small>
                  </OverlayTrigger>
                </Checkbox>
                : null
              }
              {'  '}
              {/* Offset number/button */}
              <InputGroup>
                <HourMinuteInput
                  ref='offsetInput'
                  bsSize='small'
                  style={{width: '65px'}}
                  onChange={setOffset} />
                <InputGroup.Button>
                  <Button
                    bsSize='small'
                    onClick={this._onClickOffset}>
                    Offset
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>
        <Row style={{marginTop: '5px', marginBottom: '5px'}}>
          {/* Route, pattern, calendar selectors */}
          <Col xs={12} sm={3}>
            <RouteSelect
              feedSource={feedSource}
              route={route}
              routes={getTableById(tableData, 'route')}
              tripCounts={tripCounts}
              setActiveEntity={setActiveEntity} />
          </Col>
          <Col xs={12} sm={3}>
            <PatternSelect
              fetchCalendarTripCountsForPattern={fetchCalendarTripCountsForPattern}
              feedSource={feedSource}
              route={route}
              activePattern={activePattern}
              tripCounts={tripCounts}
              setActiveEntity={setActiveEntity} />
          </Col>
          <Col xs={12} sm={3} data-test-id='calendar-select-container'>
            <CalendarSelect
              activePattern={activePattern}
              route={route}
              feedSource={feedSource}
              activeCalendar={activeCalendar}
              calendars={calendars}
              setActiveEntity={setActiveEntity}
              tripCounts={tripCounts}
              trips={trips} />
          </Col>
          <Col sm={3}>
            {/* Edit timetable buttons */}
            <ButtonGroup className='pull-right'>
              {buttons.map(button => (
                <OverlayTrigger
                  placement='bottom'
                  key={button.id}
                  overlay={
                    <Tooltip id={`tooltip-${button.id}`}>
                      {button.tooltip}
                    </Tooltip>
                  }>
                  <Button
                    bsSize='small'
                    {...button.props} />
                </OverlayTrigger>
              ))}
            </ButtonGroup>
          </Col>
        </Row>
      </div>
    )
  }
}
