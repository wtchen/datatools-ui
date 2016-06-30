import React, {Component, PropTypes} from 'react'
import { Table, ListGroup, Nav, NavItem, ListGroupItem, Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, Collapse, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'
import moment from 'moment'
// import update from 'react-addons-update'

import EditableTextField from '../../common/components/EditableTextField'
import EditableCell from '../../common/components/EditableCell'

export default class TimetableEditor extends Component {

  constructor (props) {
    super(props)
    this.state = {
      activeCell: null // 'rowNum-colNum', e.g. 0-1
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log('receiving props')
    const activePattern = nextProps.route && nextProps.route.tripPatterns ? nextProps.route.tripPatterns.find(p => p.id === nextProps.activePatternId) : null
    const activeSchedule = nextProps.tableData.calendar ? nextProps.tableData.calendar.find(c => c.id === nextProps.activeScheduleId) : null
    const trips = activePattern && activeSchedule ? activePattern[nextProps.activeScheduleId] : []
    const sortedTrips = trips ? trips.sort((a, b) => {
      // if(a.isCreating && !b.isCreating) return -1
      // if(!a.isCreating && b.isCreating) return 1
      if(a.stopTimes[0].departureTime < b.stopTimes[0].departureTime) return -1
      if(a.stopTimes[0].departureTime > b.stopTimes[0].departureTime) return 1
      return 0
    }) : []
    // console.log(activeSchedule)
    const calendars = nextProps.tableData.calendar
    const tripRows = sortedTrips.map(trip => {
      let tripRow = [
        trip.blockId,
        trip.gtfsTripId,
        trip.tripHeadsign
      ]
      trip.stopTimes.map(st => {
        tripRow.push(st.arrivalTime)
        tripRow.push(st.departureTime)
      })
      return tripRow
    })
    this.setState({
      data: tripRows
    })
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  render () {
    console.log(this.state)
    const { feedSource, route, activePatternId, tableData, activeScheduleId } = this.props
    // if (!feedSource) {
    //   return null
    // }
    const activePattern = route && route.tripPatterns ? route.tripPatterns.find(p => p.id === activePatternId) : null
    const activeSchedule = tableData.calendar ? tableData.calendar.find(c => c.id === activeScheduleId) : null
    const trips = activePattern && activeSchedule ? activePattern[activeScheduleId] : []
    const sortedTrips = trips ? trips.sort((a, b) => {
      // if(a.isCreating && !b.isCreating) return -1
      // if(!a.isCreating && b.isCreating) return 1
      if(a.stopTimes[0].departureTime < b.stopTimes[0].departureTime) return -1
      if(a.stopTimes[0].departureTime > b.stopTimes[0].departureTime) return 1
      return 0
    }) : []
    // console.log(activeSchedule)
    const calendars = tableData.calendar
    const tripRows = sortedTrips.map(trip => {
      let tripRow = [
        trip.blockId,
        trip.gtfsTripId,
        trip.tripHeadsign
      ]
      trip.stopTimes.map(st => {
        tripRow.push(st.arrivalTime)
        tripRow.push(st.departureTime)
      })
      return tripRow
    })

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
      <ButtonToolbar
        className='pull-right'
      >
        <Button
          onClick={() => {
            let newRow = []
            newRow.push([])
            newRow.push([])
            newRow.push([])
            for (var i = 0; i < activePattern.patternStops.length * 2 - 1; i++) {
              newRow.push([])
            }
            let newRows = [...this.state.data, newRow]
            // newRows.push(newRow)
            this.setState({data: newRows})
          }}
          bsStyle='default'
        >
          <Icon name='plus'/> New trip
        </Button>
        <Button
          onClick={() => {

          }}
          bsStyle='primary'
        >
          Save
        </Button>
      </ButtonToolbar>
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
        ?
          // <Table striped hover>
          <table className='handsontable'>
            <thead
              // style={{position: 'fixed'}}
            >
              <tr>
                <th
                  style={{width: '60px'}}
                >
                  Block ID
                </th>
                <th
                  style={{width: '300px'}}
                >
                  Trip ID
                </th>
                <th
                  style={{width: '300px'}}
                >
                  Trip Headsign
                </th>
                {activePattern
                  ? activePattern.patternStops.map(ps => {
                    let stop = tableData.stop ? tableData.stop.find(st => st.id === ps.stopId) : null
                    let stopName = stop ? stop.stop_name : ps.stopId
                    // return null
                    return (
                      <th
                        title={stopName}
                        style={{width: '100px'}}
                        colSpan='2'
                      >
                        {stopName.length > 18 ? stopName.substr(0, 18) + '...' : stopName}
                      </th>
                    )
                  })
                  : <th className='text-center'><Icon spin name='refresh' /></th>
                }
              </tr>
            </thead>
            <tbody>
              {this.state.data
                ? this.state.data.map((row, rowIndex) => {
                  return (
                    <tr style={{margin: 0, padding: 0}}>
                    {row.map((col, colIndex) => {
                      let cellStyle = {
                        width: '60px',
                        color: colIndex > 2 && colIndex % 2 === 0 ? '#aaa' : '#000',
                      }
                      return (
                        <EditableCell
                          ref={`cell-${rowIndex}-${colIndex}`}
                          onChange={(value) => {
                            let newRows = [...this.state.data]
                            console.log(value)
                            newRows[rowIndex][colIndex] = value
                            this.setState({data: newRows})
                          }}
                          key={`cell-${rowIndex}-${colIndex}`}
                          // onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${colIndex}`}) }}
                          onLeft={(evt) => { colIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex}-${colIndex - 1}`}) }}
                          onRight={(evt) => { colIndex + 1 <= row.length && this.setState({activeCell: `${rowIndex}-${colIndex + 1}`}) }}
                          onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${colIndex}`}) }}
                          onDown={(evt) => { rowIndex + 1 <= sortedTrips.length - 1 && this.setState({activeCell: `${rowIndex + 1}-${colIndex}`}) }}
                          handlePastedRows={(rows) => {
                            console.log(rows)
                            let newRows = [...this.state.data]
                            console.log(rows.length)
                            console.log(rows[0].length)
                            let date = moment().startOf('day').format('YYYY-MM-DD')
                            for (var i = 0; i < rows.length; i++) {
                              for (var j = 0; j < rows[0].length; j++) {
                                console.log('row ' + rowIndex + i + ' col ' + colIndex + j)
                                if (typeof newRows[i + rowIndex] !== 'undefined' && typeof newRows[i + rowIndex][j + colIndex] !== 'undefined')
                                  newRows[i + rowIndex][j + colIndex] = moment(date + 'T' + rows[i][j], ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a']).diff(date, 'seconds')
                              }
                            }
                            console.log(newRows)
                            this.setState({activeCell: `${rowIndex}-${colIndex}`, data: newRows})
                          }}
                          invalidData={colIndex > 2 && col >= 0 && col < this.state.data[rowIndex][colIndex - 1]}
                          isEditing={this.state.activeCell === `${rowIndex}-${colIndex}` }
                          isFocused={false}
                          renderTime={colIndex >= 3}
                          cellRenderer={colIndex < 3
                            ? (value) => value
                            : (value) => {
                              if (value >= 0)
                                return moment().startOf('day').seconds(value).format('HH:mm:ss')
                              else {
                                return ''
                              }
                            }
                          }
                          // reverseRenderer={(value) => {
                          //   let date = moment().startOf('day').format('YYYY-MM-DD')
                          //   return moment(date + 'T' + value, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a']).diff(date, 'seconds')
                          // }}
                          data={col}//colIndex < 3 || isNaN(col) ? col : moment().startOf('day').seconds(col).format('HH:mm:ss')}
                          style={cellStyle}
                        />
                      )
                    })}
                    </tr>
                  )
                })
                : null
              }
              {sortedTrips && false
                ? sortedTrips.map((t, rowIndex) => {
                  // let move = (row, col) => {
                  //   this.setState({activeCell: `${row}-${col}`})
                  // }
                  return (
                    <tr style={{margin: 0, padding: 0}}>
                      <EditableCell
                        ref={`cell-${rowIndex}-0`}
                        onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${0}`}) }}
                        onLeft={(evt) => { return false }}
                        onRight={(evt) => { this.setState({activeCell: `${rowIndex}-${0 + 1}`}) }}
                        onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${0}`}) }}
                        onDown={(evt) => { this.setState({activeCell: `${rowIndex + 1}-${0}`}) }}
                        handlePastedRows={(rows) => {
                          console.log(rows)
                        }}
                        isEditing={this.state.activeCell === `${rowIndex}-${0}` }
                        isFocused={false}
                        data={t.blockId}
                      />
                      <EditableCell
                        ref={`cell-${rowIndex}-1`}
                        onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${1}`}) }}
                        onLeft={(evt) => { this.setState({activeCell: `${rowIndex}-${1 - 1}`}) }}
                        onRight={(evt) => { this.setState({activeCell: `${rowIndex}-${1 + 1}`}) }}
                        onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${1}`}) }}
                        onDown={(evt) => { this.setState({activeCell: `${rowIndex + 1}-${1}`}) }}
                        handlePastedRows={(rows) => {
                          console.log(rows)
                        }}
                        isEditing={this.state.activeCell === `${rowIndex}-${1}` }
                        isFocused={false}
                        data={t.gtfsTripId}
                      />
                      <EditableCell
                        ref={`cell-${rowIndex}-2`}
                        onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${2}`}) }}
                        onLeft={(evt) => { this.setState({activeCell: `${rowIndex}-${2 - 1}`}) }}
                        onRight={(evt) => { this.setState({activeCell: `${rowIndex}-${2 + 1}`}) }}
                        onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${2}`}) }}
                        onDown={(evt) => { this.setState({activeCell: `${rowIndex + 1}-${2}`}) }}
                        handlePastedRows={(rows) => {
                          console.log(rows)
                        }}
                        isEditing={this.state.activeCell === `${rowIndex}-${2}` }
                        isFocused={false}
                        data={t.tripHeadsign}
                      />
                      {
                        t.stopTimes.map((st, index) => {
                          let colOffset = 3 // number of standard columns to right (e.g., block id, trip id, headsign)
                          let colIndex = 2 * index + colOffset
                          let maxRight = (2 * t.stopTimes.length) + colOffset - 1
                          let departureColIndex = colIndex + 1
                          return ([
                            <EditableCell
                              ref={`cell-${rowIndex}-${colIndex}`}
                              onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${colIndex}`}) }}
                              onLeft={(evt) => { colIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex}-${colIndex - 1}`}) }}
                              onRight={(evt) => { colIndex + 1 <= maxRight && this.setState({activeCell: `${rowIndex}-${colIndex + 1}`}) }}
                              onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${colIndex}`}) }}
                              onDown={(evt) => { rowIndex + 1 <= sortedTrips.length - 1 && this.setState({activeCell: `${rowIndex + 1}-${colIndex}`}) }}
                              handlePastedRows={(rows) => {
                                console.log(rows)
                              }}
                              isEditing={this.state.activeCell === `${rowIndex}-${colIndex}` }
                              isFocused={false}
                              data={moment().startOf('day').seconds(st.arrivalTime).format('HH:mm:ss')}
                              style={{width: '60px'}}
                            />
                            ,
                            <EditableCell
                              ref={`cell-${rowIndex}-${departureColIndex}`}
                              onClick={(evt) => { this.setState({activeCell: `${rowIndex}-${departureColIndex}`}) }}
                              onLeft={(evt) => { departureColIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex}-${departureColIndex - 1}`}) }}
                              onRight={(evt) => { departureColIndex + 1 <= maxRight && this.setState({activeCell: `${rowIndex}-${departureColIndex + 1}`}) }}
                              onUp={(evt) => { rowIndex - 1 >= 0 && this.setState({activeCell: `${rowIndex - 1}-${departureColIndex}`}) }}
                              onDown={(evt) => { rowIndex + 1 <= sortedTrips.length - 1 && this.setState({activeCell: `${rowIndex + 1}-${departureColIndex}`}) }}
                              handlePastedRows={(rows) => {
                                console.log(rows)
                              }}
                              isEditing={this.state.activeCell === `${rowIndex}-${departureColIndex}` }
                              isFocused={false}
                              data={moment().startOf('day').seconds(st.departureTime).format('HH:mm:ss')}
                              style={{width: '60px', color: '#aaa'}}
                            />
                          ])
                        })
                      }
                    </tr>
                  )
                })
                : null // <tr><td colSpan={sortedTrips ? sortedTrips[0].stopTimes.length + 2 : 3} className='text-center'><Icon spin name='refresh' /></td></tr>
              }
            </tbody>
          </table>
          // </Table>
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
