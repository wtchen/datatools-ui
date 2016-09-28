import React, {Component, PropTypes} from 'react'
import { InputGroup, Checkbox, Nav, NavItem, NavDropdown, MenuItem, Button, Form, FormControl } from 'react-bootstrap'
import Icon from 'react-fa'
import clone from 'clone'
import ReactDOM from 'react-dom'
import moment from 'moment'
import truncate from 'truncate'
import update from 'react-addons-update'
import objectPath from 'object-path'

import EditableCell from '../../common/components/EditableCell'
import HourMinuteInput from './HourMinuteInput'

export default class TimetableEditor extends Component {
  static propTypes = {
    route: PropTypes.object,
    activePatternId: PropTypes.string,
    activeScheduleId: PropTypes.string,
    feedSource: PropTypes.object,
    saveTripsForCalendar: PropTypes.func,
    tableData: PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {
      activeCell: null, // 'rowNum-colNum', e.g. 0-1
      // rows: [{block: 0, gtfsTripId: 'trp', tripHeadsign: 'trip'}],
      edited: [],
      selected: [],
      offsetSeconds: 0
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
      let stateUpdate = { selected: { $push: [rowIndex] } }
      this.setState(update(this.state, stateUpdate))
    }
    else {
      let stateUpdate = { selected: { $splice: [[selectIndex, 1]] } }
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
  addNewRow (columns, blank = false) {
    const activePattern = this.props.route && this.props.route.tripPatterns ? this.props.route.tripPatterns.find(p => p.id === this.props.activePatternId) : null

    // set blank to true if there are no rows to clone
    blank = blank || this.state.data.length === 0
    let newRow = blank ? {} : clone(this.state.data[this.state.data.length - 1]) || {}

    // set starting time for first arrival
    let cumulativeTravelTime = blank ? 0 : objectPath.get(newRow, `stopTimes.0.arrivalTime`)
    cumulativeTravelTime += this.state.offsetSeconds

    for (let i = 0; i < activePattern.patternStops.length; i++) {
      let stop = activePattern.patternStops[i]
      // if stopTime null/undefined, set as new object
      if (!objectPath.get(newRow, `stopTimes.${i}`)) {
        objectPath.set(newRow, `stopTimes.${i}`, {})
      }
      console.log(objectPath.get(newRow, `stopTimes.${i}`))
      objectPath.set(newRow, `stopTimes.${i}.stopId`, stop.stopId)
      cumulativeTravelTime += +stop.defaultTravelTime
      objectPath.set(newRow, `stopTimes.${i}.arrivalTime`, cumulativeTravelTime)
      cumulativeTravelTime += +stop.defaultDwellTime
      objectPath.set(newRow, `stopTimes.${i}.departureTime`, cumulativeTravelTime)
    }
    for (let i = 0; i < columns.length; i++) {
      let col = columns[i]
      if (/TIME/.test(col.type)) {
        // TODO: add default travel/dwell times to new rows
        // objectPath.ensureExists(newRow, col.key, 0)
      } else {
        objectPath.ensureExists(newRow, col.key, null)
      }
    }
    // important: set id to "new"
    objectPath.set(newRow, 'id', 'new')
    objectPath.set(newRow, 'gtfsTripId', null)
    objectPath.set(newRow, 'useFrequency', activePattern.useFrequency)
    objectPath.set(newRow, 'feedId', this.props.feedSource.id)
    objectPath.set(newRow, 'patternId', activePattern.id)
    objectPath.set(newRow, 'calendarId', this.props.activeScheduleId)
    let newRows = [...this.state.data, newRow]
    let stateUpdate = {
      data: {$set: newRows},
      activeCell: {$set: `${newRows.length - 1}-${0}`},
      edited: { $push: [this.state.data.length] }
    }
    this.setState(update(this.state, stateUpdate))
  }
  removeSelectedRows (feedSourceId, pattern, scheduleId) {
    let splice = []
    let removed = []
    let tripsToDelete = []
    let newRows = [...this.state.data]
    let selectedDescending = this.state.selected.sort((a,b) => {
      return b - a
    })
    // loop over selected array in descending order to ensure that splice operates on indexes in reverse
    for (var i = 0; i < selectedDescending.length; i++) {
      let rowIndex = selectedDescending[i]

      // removed.push([this.state.selected[i], 1])
      let row = newRows[rowIndex]
      if (row.id === 'new') {
        splice.push([rowIndex, 1])
      } else {
        tripsToDelete.push(row)
      }
    }
    if (tripsToDelete.length > 0) {
      this.props.deleteTripsForCalendar(feedSourceId, pattern, scheduleId, tripsToDelete)
    }
    console.log(splice)
    let stateUpdate = {
      data: {$splice: splice},
      selected: {$set: []}
    }
    this.setState(update(this.state, stateUpdate))
  }
  componentWillReceiveProps (nextProps) {
    console.log('receiving props')
    const activePattern = nextProps.route && nextProps.route.tripPatterns ? nextProps.route.tripPatterns.find(p => p.id === nextProps.activePatternId) : null
    const activeSchedule = nextProps.tableData.calendar ? nextProps.tableData.calendar.find(c => c.id === nextProps.activeScheduleId) : null
    const trips = activePattern && activeSchedule ? activePattern[nextProps.activeScheduleId] : []
    // add unsaved trips to list of trips received
    if (this.state.edited.length > 0) {
      for (var i = 0; i < this.state.edited.length; i++) {
        let rowIndex = this.state.edited[i]
        let trip = this.state.data[rowIndex]
        if (trip) {
          trips.push(trip)
        }
      }
    }
    const sortedTrips = trips ? trips
      .filter(t => t.useFrequency === activePattern.useFrequency) // filter out based on useFrequency
      .sort((a, b) => {
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
      // edited: [],
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
  offsetRows (rowIndexes, offsetAmount, columns) {
    let newRows = [...this.state.data]
    let editedRows = []
    console.log(`Offsetting ${rowIndexes.length} rows by ${offsetAmount} seconds`)
    for (var i = 0; i < rowIndexes.length; i++) {
      let row = newRows[rowIndexes[i]]
      editedRows.push(rowIndexes[i])
      for (var j = 0; j < columns.length; j++) {
        let col = columns[j]
        let path = `${rowIndexes[i]}.${col.key}`
        if (/TIME/.test(col.type)) {
          let currentVal = objectPath.get(newRows, path)
          let newVal = currentVal + offsetAmount % 86399 // ensure seconds does not exceed 24 hours
          objectPath.set(newRows, path, newVal)
        }
      }
    }
    let stateUpdate = {
      data: {$set: newRows},
      edited: {$push: editedRows}
    }
    this.setState(update(this.state, stateUpdate))
  }
  handlePastedRows (pastedRows, rowIndex, colIndex, columns) {
    let newRows = [...this.state.data]
    let date = moment().startOf('day').format('YYYY-MM-DD')
    let editedRows = []
    for (var i = 0; i < pastedRows.length; i++) {
      editedRows.push(i)
      // TODO: fix handlePaste to accommodate new pastedRows objects
      for (var j = 0; j < pastedRows[0].length; j++) {
        let path = `${rowIndex + i}.${columns[colIndex + j].key}`
        if (typeof newRows[i + rowIndex] !== 'undefined' && typeof objectPath.get(newRows, path) !== 'undefined') {
          let newValue = moment(date + 'T' + pastedRows[i][j], ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTh:mm:ss a', 'YYYY-MM-DDTh:mm a']).diff(date, 'seconds')
          objectPath.set(newRows, path, newValue)
        }
      }
    }
    let stateUpdate = {activeCell: {$set: `${rowIndex}-${colIndex}`}, data: {$set: newRows}, edited: { $push: editedRows }}
    this.setState(update(this.state, stateUpdate))
  }
  saveEditedTrips (activePattern, activeScheduleId) {
    let trips = []
    let tripIndexes = []
    for (var i = 0; i < this.state.edited.length; i++) {
      let rowIndex = this.state.edited[i]
      if (tripIndexes.indexOf(rowIndex) === -1) {
        let trip = this.state.data[rowIndex]
        if (trip) {
          trips.push(trip)
          tripIndexes.push(rowIndex)
        }
      }
    }

    this.props.saveTripsForCalendar(this.props.feedSource.id, activePattern, activeScheduleId, trips)
    .then((errorIndexes) => {
      console.log(errorIndexes)
      let edited = []
      for (var i = 0; i < errorIndexes.length; i++) {
        edited.push(this.state.edited[errorIndexes[i]])
      }
      let stateUpdate = {
        edited: {$set: edited}
      }
      this.setState(update(this.state, stateUpdate))
    })
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
      if (value === 0) {
        return moment().startOf('day').seconds(value).format('HH:mm:ss')
      }
      else if (value && value > 0)
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
      // columns added if using freqency schedule type
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
      ? 'Frequencies for'
      : 'Timetables for'
    const headerText = <span>{tableType} {activePattern ? <span title={activePattern.name}>{truncate(activePattern.name, 20)}</span> : <Icon spin name='refresh' />}</span>
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
            <HourMinuteInput
              ref='offsetInput'
              style={{width: '65px'}}
              onChange={(seconds) => {
                this.setState({offsetSeconds: seconds})
              }}
            />
            <InputGroup.Button>
              <Button
                // disabled={this.state.selected.length === 0}
                onClick={() => {
                  if (this.state.selected.length > 0) {
                    this.offsetRows(this.state.selected, this.state.offsetSeconds, columns)
                  }
                  // if no rows selected, offset last row
                  else {
                    this.offsetRows([this.state.data.length - 1], this.state.offsetSeconds, columns)
                  }

                }}
              >
                Offset
              </Button>
            </InputGroup.Button>
          </InputGroup>
          {'  '}
          <Button
            onClick={() => this.addNewRow(columns)}
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
              this.saveEditedTrips(activePattern, activeScheduleId)
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
          <NavDropdown eventKey="4" title="More..." id="nav-dropdown">
            <MenuItem eventKey="4.1">Action</MenuItem>
            <MenuItem eventKey="4.2">Another action</MenuItem>
            <MenuItem eventKey="4.3">Something else here</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="4.4">Separated link</MenuItem>
          </NavDropdown>
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
                    {/* Select all checkbox */}
                    <input
                      ref='check-all'
                      type='checkbox'
                      checked={this.state.selected.length && this.state.selected.length === this.state.data.length}
                      onClick={(e) => {
                        let selected = []
                        if (this.state.selected.length !== this.state.data.length) {
                          for (let i = 0; i < this.state.data.length; i++) {
                            selected.push(i)
                          }
                        }
                        this.setState({selected})
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
                        if (col.key === 'gtfsTripId' && val === null) {
                          val = objectPath.get(row, 'id') !== 'new' ? objectPath.get(row, 'id') : null
                        }
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
