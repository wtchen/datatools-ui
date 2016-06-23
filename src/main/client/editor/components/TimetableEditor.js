import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, Nav, NavItem, ListGroupItem, Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, Collapse, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'
import moment from 'moment'

import EditableTextField from '../../common/components/EditableTextField'

export default class TimetableEditor extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps (nextProps) {
  }
  render () {
    const { feedSource, route, activePatternId, tableData, activeScheduleId } = this.props
    // if (!feedSource) {
    //   return null
    // }
    const activePattern = route && route.tripPatterns ? route.tripPatterns.find(p => p.id === activePatternId) : null
    const activeSchedule = tableData.calendar ? tableData.calendar.find(c => c.id === activeScheduleId) : null
    const trips = activePattern && activeSchedule ? activePattern[activeScheduleId] : []
    console.log(activeSchedule)
    const calendars = tableData.calendar
    const panelStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      overflowX: 'scroll',
      position: 'absolute',
      // marginLeft: '500px',
      top: '0px',
      left: '0px',
      // overflowY: 'scroll',
      zIndex: 200,
      // backgroundColor: 'white',
      paddingRight: '5px',
      paddingLeft: '5px',
    }
    return (
      <div
        style={panelStyle}
        className='timetable-editor'
      >
      <h3>
        <Button
          onClick={() => {
            this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern)
          }}
        ><Icon name='reply'/> Back to route</Button>
        {' '}
        Editing timetables for {activePattern ? activePattern.name : <Icon spin name='refresh' />}
      </h3>
      <Nav style={{marginBottom: '5px'}} bsStyle='tabs' activeKey={activeScheduleId} onSelect={this.handleSelect}>
        {calendars
          ? calendars.map(c => {
            return (
              <NavItem
                eventKey={c.id}
                onClick={() => {
                  if (activeScheduleId === c.id) {
                    // this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable')
                  }
                  else {
                    this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', c)
                  }
                }}
              >
                {c.description}
              </NavItem>
            )
          })
          : null
        }
        <NavItem
          eventKey={'scheduleexception'}
          onClick={() => {
            if (this.props.activeComponent !== 'scheduleexception') {
              this.props.setActiveEntity(feedSource.id, 'calendar')
              // browserHistory.push(`/feed/${this.props.feedSource.id}/edit/scheduleexception`)
            }
          }}
        >
          <Icon name='plus'/> Add calendar
        </NavItem>
      </Nav>
      {activeSchedule
        ? <Table
            responsive
          >
            <thead>
              <tr>
                <th>Block ID</th>
                <th>Trip ID</th>
                {activePattern
                  ? activePattern.patternStops.map(ps => {
                    let stop = tableData.stop ? tableData.stop.find(st => st.id === ps.stopId) : null
                    let stopName = stop ? stop.stop_name : ps.stopId
                    return (
                      <th>{stopName}</th>
                    )
                  })
                  : <th className='text-center'><Icon spin name='refresh' /></th>
                }
              </tr>
            </thead>
            <tbody>
              {trips
                ? trips.map(t => {
                  return (
                    <tr>
                      <td contenteditable>{t.blockId}</td>
                      <td contenteditable>{t.gtfsTripId}</td>
                      {
                        t.stopTimes.map(st => {
                          return (
                            <td contenteditable>{st.arrivalTime}</td>
                          )
                        })
                      }
                    </tr>
                  )
                })
                : <tr><td colspan={trips ? trips[0].stopTimes.length + 2 : 3} className='text-center'><Icon spin name='refresh' /></td></tr>
              }
            </tbody>
          </Table>
        : <p className='lead text-center'>
            Choose a calendar to edit timetables or
            {' '}
            <a
              bsStyle='link'
              href='#'
              onClick={(e) => {
                e.preventDefault()
                this.props.setActiveEntity(feedSource.id, 'calendar')
              }}
            >create a new one</a>.
          </p>
      }
      </div>
    )
  }
}
