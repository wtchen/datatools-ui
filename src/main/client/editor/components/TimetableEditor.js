import React, {Component, PropTypes} from 'react'
import { InputGroup, Table, Checkbox, ListGroup, Nav, NavItem, ListGroupItem, Button, ButtonGroup, DropdownButton, MenuItem, ButtonToolbar, Collapse, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import {Icon} from 'react-fa'
import moment from 'moment'
import update from 'react-addons-update'
import objectPath from 'object-path'

import EditableTextField from '../../common/components/EditableTextField'
import EditableCell from '../../common/components/EditableCell'

export default class TimetableEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeCell: null, // 'rowNum-colNum', e.g. 0-1
      // rows: [{block: 0, gtfsTripId: 'trp', tripHeadsign: 'trip'}],
      edited: [],
      selected: []
    }
  }
  updateDimensions () {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }
  componentWillMount () {
    this.updateDimensions()
  }
  componentDidMount () {
    window.addEventListener('resize', () => this.updateDimensions())
  }
  componentWillUnmount () {
    window.removeEventListener('resize', () => this.updateDimensions())
  }
  toggleRowSelection (rowIndex) {
    let selectIndex = this.state.selected.indexOf(rowIndex)
    console.log(selectIndex)
    if (selectIndex === -1) {
      let stateUpdate = { selected: { $push: [rowIndex] }}
      this.setState(update(this.state, stateUpdate))
    }
    else {
      let stateUpdate = {selected: { $splice: [[selectIndex, 1]] }}
      this.setState(update(this.state, stateUpdate))
    }
  }
  setCellValue (value, rowIndex, key) {
    let newRows = [...this.state.data]
    objectPath.set(newRows, key, value)
    // newRows[rowIndex][col.key] = value
    let stateUpdate = { edited: { $push: [rowIndex] }, data: {$set: newRows} }
    this.setState(update(this.state, stateUpdate))
  }
  addNewRow () {
    let newRow = Object.assign({}, this.state.data[this.state.data.length - 1])
    for (var i = 0; i < columns.length; i++) {
      let col = columns[i]
      if (/TIME/.test(col.type)) {
        objectPath.set(newRow, col.key, 0)
      }
      else {
        objectPath.set(newRow, col.key, null)
      }
    }
    objectPath.set(newRow, 'id', 'new')
    let newRows = [...this.state.data, newRow]
    // newRows.push(newRow)
    this.setState({data: newRows, activeCell: `${newRows.length - 1}-${0}` })
  }
  removeSelectedRows (feedSourceId, pattern, scheduleId) {
    let splice = []
    let removed = []
    let trips = []
    for (var i = 0; i < this.state.selected.length; i++) {
      // this.state.selected[i]
      // splice.push([this.state.selected[i], 1])
      // removed.push([this.state.selected[i], 1])
      trips.push(this.state.data[this.state.selected[i]])
    }
    this.props.deleteTripsForCalendar(feedSourceId, pattern, scheduleId, trips)
    let stateUpdate = {
      // data: {$splice: splice},
      selected: {$set: []}
    }
    this.setState(update(this.state, stateUpdate))
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
    this.setState({
      data: sortedTrips, // tripRows
      edited: [],
      hideDepartureTimes: false
    })
  }
  shouldComponentUpdate (nextProps) {
    return true
  }
  // rowGetter (rowIdx) {
  //   return this.state ? this.state.rows[rowIdx] : {block: 0, gtfsTripId: 'trp', tripHeadsign: 'trip'}
  // }
  // handleRowUpdated (e) {
  //   //merge updated row with current row and rerender by setting state
  //   var rows = this.state.rows;
  //   Object.assign(rows[e.rowIdx], e.updated);
  //   this.setState({rows:rows});
  // }
  _onDown (evt, rowIndex, colIndex) {
      if (rowIndex + 1 <= this.state.data.length - 1) {
        this.setState({activeCell: `${rowIndex + 1}-${colIndex}`})
        return true
      }
      else {
        return false
      }
  }
  _onUp (evt, rowIndex, colIndex) {
    if (rowIndex - 1 >= 0) {
      this.setState({activeCell: `${rowIndex - 1}-${colIndex}`})
      return true
    }
    else {
      return false
    }
  }
  _onRight (evt, rowIndex, colIndex, columns) {
    if (colIndex + 1 <= columns.length - 1) {
      this.setState({activeCell: `${rowIndex}-${colIndex + 1}`})
      return true
    }
    else {
      return false
    }
  }
  _onLeft (evt, rowIndex, colIndex) {
    if (colIndex - 1 >= 0) {
      this.setState({activeCell: `${rowIndex}-${colIndex - 1}`})
      return true
    }
    else {
      return false
    }
  }
  handlePastedRows (rows, rowIndex, colIndex, columns) {
    let newRows = [...this.state.data]
    let date = moment().startOf('day').format('YYYY-MM-DD')
    let editedRows = []
    for (var i = 0; i < rows.length; i++) {
      editedRows.push(i)
      // TODO: fix handlePaste to accommodate new rows objects
      for (var j = 0; j < rows[0].length; j++) {
        let path = `${rowIndex + i}.${columns[colIndex + j].key}`
        if (typeof newRows[i + rowIndex] !== 'undefined' && typeof objectPath.get(newRows, path) !== 'undefined') {
          let newValue = moment(date + 'T' + rows[i][j], ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a']).diff(date, 'seconds')
          objectPath.set(newRows, path, newValue)
        }
      }
    }
    let stateUpdate = {activeCell: {$set: `${rowIndex}-${colIndex}`}, data: {$set: newRows}, edited: { $push: editedRows }}
    this.setState(update(this.state, stateUpdate))
  }
  isDataValid (col, value, previousValue) {
    if (/TIME/.test(col.type)) {
      return value && value >= 0 && value < previousValue
    }
    else {
      return true
    }
  }
  getCellRenderer (col, value) {
    if (!/TIME/.test(col.type)) {
      return value
    }
    else {
      if (value && value >= 0)
        return moment().startOf('day').seconds(value).format('HH:mm:ss')
      else {
        return ''
      }
    }
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

    // console.log(activeSchedule)
    const calendars = tableData.calendar
    const panelStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      overflowX: 'scroll',
      paddingRight: '5px',
      paddingLeft: '5px',
    }

    const headerWidth = this.state.width - (this.props.sidebarExpanded ? 150 : 50)
    const headerStyle = {
      position: 'fixed',
      zIndex: 1000,
      backgroundColor: 'white',
      width: `${headerWidth}px`,
      paddingRight: '10px'
    }
    const columns = [
      {
        name: 'Block ID',
        width: 30,
        key: 'blockId',
        type: 'TEXT',
        placeholder: '300'
      },
      {
        name: 'Trip ID',
        width: 300,
        key: 'gtfsTripId',
        type: 'TEXT',
        placeholder: '12345678'
      },
      {
        name: 'Trip Headsign',
        width: 300,
        key: 'tripHeadsign',
        type: 'TEXT',
        placeholder: 'Destination via Transfer Center'
      },
    ]
    if (activePattern && activePattern.patternStops) {
      if (!activePattern.useFrequency) {
        activePattern.patternStops.map((ps, index) => {
          let stop = tableData.stop ? tableData.stop.find(st => st.id === ps.stopId) : null
          let stopName = stop ? stop.stop_name : ps.stopId
          columns.push({
            name: stopName && stopName.length > 15 ? stopName.substr(0, 15) + '...' : stopName,
            title: stopName,
            width: 100,
            key: `stopTimes.${index}.arrivalTime`,
            colSpan: '2',
            hidden: false,
            type: 'ARRIVAL_TIME',
            placeholder: 'HH:MM:SS'
          })
          columns.push({
            key: `stopTimes.${index}.departureTime`,
            hidden: this.state.hideDepartureTimes,
            type: 'DEPARTURE_TIME',
            placeholder: 'HH:MM:SS'
          })
        })
      }
      else {
        columns.push({
          name: 'Start time',
          width: 100,
          key: 'startTime',
          type: 'TIME',
          placeholder: 'HH:MM:SS'
        })
        columns.push({
          name: 'End time',
          width: 100,
          key: 'endTime',
          type: 'TIME',
          placeholder: 'HH:MM:SS'
        })
        columns.push({
          name: 'Headway',
          width: 60,
          key: 'headway',
          type: 'MINUTES',
          placeholder: '15 (min)'
        })
      }
    }
    const tableType = !activePattern
      ? ''
      : activePattern.useFrequency
      ? 'Editing frequencies for'
      : 'Editing timetables for'
    const headerText = <span>{tableType} {activePattern ? activePattern.name : <Icon spin name='refresh' />}</span>
    return (
      <div
        style={panelStyle}
        className='timetable-editor'
      >
      <div
        className='timetable-header'
        style={headerStyle}
      >
        <h3>
        <Form
          className='pull-right'
          inline
        >
          {activePattern && !activePattern.useFrequency
            ? <Checkbox
                value={this.state.hideDepartureTimes}
                onChange={(evt) => {
                  this.setState({hideDepartureTimes: !this.state.hideDepartureTimes})
                }}
              >
                <small> Hide departure times</small>
              </Checkbox>
            : null
          }
          {'  '}
          <InputGroup>
            <FormControl style={{width: '40px'}} type='text' />
            <InputGroup.Button>
              <Button>
                Offset
              </Button>
            </InputGroup.Button>
          </InputGroup>
          {'  '}
          <Button
            onClick={() => {
              let newRow = {} // Object.assign({}, this.state.data[this.state.data.length - 1])
              let cumulativeTravelTime = 0
              for (var i = 0; i < activePattern.patternStops.length; i++) {
                let stop = activePattern.patternStops[i]
                console.log(stop)

                objectPath.ensureExists(newRow, `stopTimes.${i}.stopId`, stop.stopId)

                cumulativeTravelTime += stop.defaultTravelTime
                objectPath.ensureExists(newRow, `stopTimes.${i}.arrivalTime`, cumulativeTravelTime)
                cumulativeTravelTime += stop.defaultDwellTime
                objectPath.ensureExists(newRow, `stopTimes.${i}.departureTime`, cumulativeTravelTime)
              }
              for (var i = 0; i < columns.length; i++) {
                let col = columns[i]
                if (/TIME/.test(col.type)) {
                  // TODO: add default travel/dwell times to new rows
                  // objectPath.ensureExists(newRow, col.key, 0)
                }
                else {
                  objectPath.ensureExists(newRow, col.key, null)
                }
              }
              objectPath.ensureExists(newRow, 'id', 'new')
              objectPath.ensureExists(newRow, 'feedId', feedSource.id)
              objectPath.ensureExists(newRow, 'patternId', activePattern.id)
              objectPath.ensureExists(newRow, 'calendarId', activeScheduleId)
              let newRows = [...this.state.data, newRow]
              // newRows.push(newRow)
              this.setState({data: newRows, activeCell: `${newRows.length - 1}-${0}` })
            }}
            bsStyle='default'
          >
            <Icon name='plus'/> New trip
          </Button>
          {'  '}
          <Button
            disabled={this.state.selected.length === 0}
          >
            <Icon name='clone'/>
          </Button>
          {'  '}
          <Button
            disabled={this.state.selected.length === 0}
            onClick={() => {
              this.removeSelectedRows(feedSource.id, activePattern, activeScheduleId)
            }}
            bsStyle='danger'
          >
            <Icon name='trash'/>
          </Button>
          {'  '}
          <Button
            disabled={this.state.edited.length === 0}
            onClick={(e) => {
              // this.props.setActiveEntity(this.props.feedSource.id, this.props.activeComponent, null)
              this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern, 'timetable', activeScheduleId)
            }}
          >
            Reset
          </Button>
          {'  '}
          <Button
            disabled={this.state.edited.length === 0}
            onClick={() => {
              let trips = []
              let tripIndexes = []
              for (var i = 0; i < this.state.edited.length; i++) {
                let rowIndex = this.state.edited[i]
                if (tripIndexes.indexOf(rowIndex) === -1) {
                  trips.push(this.state.data[rowIndex])
                  tripIndexes.push(rowIndex)
                }
              }
              this.props.saveTripsForCalendar(feedSource.id, activePattern, activeScheduleId, trips)
            }}
            bsStyle='primary'
          >
            Save
          </Button>
        </Form>
          <Button
            onClick={() => {
              this.props.setActiveEntity(feedSource.id, 'route', route, 'trippattern', activePattern)
            }}
          ><Icon name='reply'/> Back to route</Button>
          {' '}
          {headerText}
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
                this.props.setActiveEntity(feedSource.id, 'calendar', {id: 'new'})
              }
            }}
          >
            <Icon name='plus'/> Add calendar
          </NavItem>
        </Nav>
      </div>
      <div
        className='timetable-body'
        style={{marginTop: '125px'}}
      >
        {activeSchedule
          ? <table
              className='handsontable'
            >
              <thead
              >
                <tr>
                  <th>
                    <input
                      ref='check-all'
                      type='checkbox'
                      checked={this.state.selected[0] === '*'}
                      // onChange={(e) => {
                      //   console.log(e.checked)
                      // }}
                      onClick={(e) => {
                        console.log(e.checked)
                        if (this.state.selected[0] === '*') {
                          this.setState({selected: []})
                        }
                        else {
                          this.setState({selected: ['*']})
                        }
                      }}
                    />
                  </th>
                  {columns.map(c => {
                    if (!c.name) return null
                    return (
                      <th
                        style={{width: `${c.width}px`}}
                        title={c.title ? c.title : c.name}
                        colSpan={c.colSpan && !this.state.hideDepartureTimes ? c.colSpan : '1'}
                      >
                        {c.name}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {this.state.data
                  ? this.state.data.map((row, rowIndex) => {
                    let rowValues = []
                    let rowCheckedColor = '#F3FAF6'
                    let rowIsChecked = this.state.selected[0] === '*' && this.state.selected.indexOf(rowIndex) === -1 || this.state.selected[0] !== '*' && this.state.selected.indexOf(rowIndex) !== -1
                    return (
                      <tr style={{margin: 0, padding: 0}}>
                      <td ref={`check-${rowIndex}`}>
                        <input
                          type='checkbox'
                          checked={rowIsChecked}
                          onClick={(e) => {
                            this.toggleRowSelection(rowIndex)
                          }}
                        />
                      </td>
                      {columns.map((col, colIndex) => {
                        let val = objectPath.get(row, col.key)
                        rowValues.push(val)
                        let cellStyle = {
                          width: '60px',
                          color: col.type === 'DEPARTURE_TIME' ? '#aaa' : '#000'
                        }
                        if (rowIsChecked) {
                          cellStyle.backgroundColor = rowCheckedColor
                        }
                        let previousValue = rowValues[colIndex - 1]

                        // if departure times are hidden do not display cell
                        if (col.hidden) return null

                        return (
                          <EditableCell
                            ref={`cell-${rowIndex}-${colIndex}`}
                            onChange={(value) => {
                              this.setCellValue(value, rowIndex, `${rowIndex}.${col.key}`)
                              // set departure time value if departure times are hidden
                              if (this.state.hideDepartureTimes && columns[colIndex + 1] && columns[colIndex + 1].type === 'DEPARTURE_TIME') {
                                this.setCellValue(value, rowIndex, `${rowIndex}.${columns[colIndex + 1].key}`)
                              }
                            }}
                            key={`cell-${rowIndex}-${colIndex}`}
                            onRowSelect={(evt) => this.toggleRowSelection(rowIndex)}
                            onLeft={(evt) => this._onLeft(evt, rowIndex, colIndex)}
                            onRight={(evt) => this._onRight(evt, rowIndex, colIndex, columns)}
                            onUp={(evt) => this._onUp(evt, rowIndex, colIndex)}
                            onDown={(evt) => this._onDown(evt, rowIndex, colIndex)}
                            duplicateLeft={(evt) => this.setCellValue(previousValue, rowIndex, `${rowIndex}.${col.key}`)}
                            handlePastedRows={(rows) => this.handlePastedRows(rows, rowIndex, colIndex, columns)}
                            invalidData={/TIME/.test(col.type) && val >= 0 && val < previousValue}
                            isEditing={this.state.activeCell === `${rowIndex}-${colIndex}` }
                            isFocused={false}
                            placeholder={col.placeholder}
                            renderTime={/TIME/.test(col.type)}
                            cellRenderer={(value) => this.getCellRenderer(col, value)}
                            data={val}
                            style={cellStyle}
                          />
                        )
                      })}
                      </tr>
                    )
                  })
                  : null
                }
              </tbody>
            </table>
          : <p className='lead text-center'>
              Choose a calendar to edit timetables or
              {' '}
              <a
                bsStyle='link'
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  this.props.setActiveEntity(feedSource.id, 'calendar', {id: 'new'})
                }}
              >create a new one</a>.
            </p>
        }
      </div> {/* End timetable body */}
      </div>
    )
  }
}
