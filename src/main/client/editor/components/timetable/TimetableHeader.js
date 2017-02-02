import React, {Component, PropTypes} from 'react'
import { InputGroup, Col, Row, Checkbox, Button, Form, OverlayTrigger, Tooltip, ButtonGroup } from 'react-bootstrap'
import truncate from 'truncate'
import {Icon} from '@conveyal/woonerf'

import HourMinuteInput from '../HourMinuteInput'
import CalendarSelect from './CalendarSelect'
import RouteSelect from './RouteSelect'
import PatternSelect from './PatternSelect'
import {getConfigProperty} from '../../../common/util/config'

export default class TimetableHeader extends Component {
  static propTypes = {
    feedSource: PropTypes.object
  }
  render () {
    const { feedSource, timetable, setOffset, offsetRows, toggleDepartureTimes, addNewRow, removeSelectedRows, saveEditedTrips, route, tableData, activeScheduleId, activePattern, setActiveEntity, fetchTripsForCalendar, duplicateRows } = this.props
    const { selected, trips, hideDepartureTimes, edited, offset } = timetable
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
    const numberOfTrips = trips ? trips.length : 0
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
              {numberOfTrips} trips for <span title={patternName}>{truncate(patternName, 15)}</span> on <span title={calendarName}>{truncate(calendarName, 13)}</span> calendar
            </h4>
          </Col>
          <Col sm={3}>
            <Form
              inline
              className='pull-right'
            >
              {activePattern && !activePattern.useFrequency && getConfigProperty('application.dev')
                ? <Checkbox
                  value={hideDepartureTimes}
                  onChange={(evt) => {
                    toggleDepartureTimes()
                  }}
                >
                  <OverlayTrigger placement='bottom' overlay={<Tooltip id='hide-departures-check'>Hiding departure times will keep arrival and departure times in sync. WARNING: do not use if arrivals and departures differ.</Tooltip>}>
                    <small> Hide departures</small>
                  </OverlayTrigger>
                </Checkbox>
                : null
              }
              {'  '}
              <InputGroup>
                <HourMinuteInput
                  ref='offsetInput'
                  style={{width: '65px'}}
                  onChange={(seconds) => {
                    setOffset(seconds)
                  }}
                />
                <InputGroup.Button>
                  <Button
                    // disabled={selected.length === 0}
                    onClick={() => {
                      if (selected.length > 0) {
                        offsetRows(selected, offset)
                      } else {
                        // if no rows selected, offset last row
                        offsetRows([trips.length - 1], offset)
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
              trips={trips}
            />
          </Col>
          <Col sm={3}>
            <ButtonGroup
              className='pull-right'
            >
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-add'>Add blank trip</Tooltip>}>
                <Button
                  onClick={() => addNewRow(true, true)}
                  bsStyle='default'
                >
                  <Icon type='plus' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-duplicate'>Duplicate trips</Tooltip>}>
                <Button
                  onClick={() => {
                    // if no rows selected, duplicate last
                    // TODO: should this duplicate row in which cursor lies?
                    if (selected.length === 0) {
                      duplicateRows([timetable.trips.length - 1])
                    } else {
                      duplicateRows(timetable.selected)
                    }
                  }}
                  disabled={timetable.trips.length === 0}
                >
                  <Icon type='clone' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-delete'>Delete trips</Tooltip>}>
                <Button
                  disabled={selected.length === 0}
                  onClick={() => {
                    removeSelectedRows()
                  }}
                  bsStyle='danger'
                >
                  <Icon type='trash' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip-undo'>Undo changes</Tooltip>}>
                <Button
                  disabled={edited.length === 0}
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
                  disabled={edited.length === 0}
                  onClick={() => {
                    saveEditedTrips(activePattern, activeScheduleId)
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
