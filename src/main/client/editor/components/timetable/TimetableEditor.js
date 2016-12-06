import React, {Component, PropTypes} from 'react'
import clone from 'clone'
import update from 'react-addons-update'
import objectPath from 'object-path'

import { isTimeFormat } from '../../util'
import TimetableHeader from './TimetableHeader'
import Timetable from './Timetable'

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
  _onResize = () => {
    this.setState({width: window.innerWidth, height: window.innerHeight})
  }
  componentWillMount () {
    this._onResize()
  }
  componentDidMount () {
    window.addEventListener('resize', this._onResize)
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this._onResize)
  }
  constructNewRow (toClone = null) {
    const activePattern = this.props.route && this.props.route.tripPatterns ? this.props.route.tripPatterns.find(p => p.id === this.props.activePatternId) : null
    let newRow = toClone ? clone(toClone) || {} : {}

    // set starting time for first arrival
    let cumulativeTravelTime = !toClone ? 0 : objectPath.get(newRow, `stopTimes.0.arrivalTime`)
    cumulativeTravelTime += this.state.offsetSeconds

    for (let i = 0; i < activePattern.patternStops.length; i++) {
      let stop = activePattern.patternStops[i]
      // if stopTime null/undefined, set as new object
      if (!objectPath.get(newRow, `stopTimes.${i}`)) {
        objectPath.set(newRow, `stopTimes.${i}`, {})
      }
      objectPath.set(newRow, `stopTimes.${i}.stopId`, stop.stopId)
      cumulativeTravelTime += +stop.defaultTravelTime
      objectPath.set(newRow, `stopTimes.${i}.arrivalTime`, cumulativeTravelTime)
      cumulativeTravelTime += +stop.defaultDwellTime
      objectPath.set(newRow, `stopTimes.${i}.departureTime`, cumulativeTravelTime)
    }
    for (let i = 0; i < this.props.timetable.columns.length; i++) {
      let col = this.props.timetable.columns[i]
      if (isTimeFormat(col.type)) {
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

    return newRow
  }
  addNewRow (blank = false, scroll = false) {
    // set blank to true if there are no rows to clone
    blank = blank || this.props.timetable.trips.length === 0

    let clone = blank ? null : this.props.timetable.trips[this.props.timetable.trips.length - 1]
    let newRow = this.constructNewRow(clone)

    let stateUpdate = {
      activeCell: {$set: null},
      scrollToRow: {$set: this.props.timetable.trips.length},
      scrollToColumn: {$set: 0}
    }
    this.props.addNewTrip(newRow)
    if (scroll) {
      this.setState(update(this.state, stateUpdate))
    }
  }
  removeSelectedRows () {
    let splice = []
    let tripsToDelete = []
    let newRows = [...this.props.timetable.trips]
    let selectedDescending = this.props.timetable.selected.sort((a, b) => {
      return b - a
    })
    // loop over selected array in descending order to ensure that splice operates on indexes in reverse
    for (var i = 0; i < selectedDescending.length; i++) {
      let rowIndex = selectedDescending[i]

      // removed.push([this.props.selected[i], 1])
      let row = newRows[rowIndex]
      if (row.id === 'new') {
        splice.push([rowIndex, 1])
      } else {
        tripsToDelete.push(row)
      }
    }
    if (tripsToDelete.length > 0) {
      this.props.deleteTripsForCalendar(this.props.feedSource.id, this.props.activePattern, this.props.activeScheduleId, tripsToDelete)
    }
    this.props.toggleAllRows(false)
  }
  componentWillReceiveProps (nextProps) {
    // console.log('receiving props')
    // const activePattern = nextProps.route && nextProps.route.tripPatterns ? nextProps.route.tripPatterns.find(p => p.id === nextProps.activePatternId) : null
    // const activeSchedule = nextProps.tableData.calendar ? nextProps.tableData.calendar.find(c => c.id === nextProps.activeScheduleId) : null
    // const trips = activePattern && activeSchedule ? activePattern[nextProps.activeScheduleId] : []
    // // add unsaved trips to list of trips received
    // if (nextProps.timetable.edited.length > 0) {
    //   console.log('changes found', nextProps.timetable.edited.length)
    //   for (var i = 0; i < nextProps.timetable.edited.length; i++) {
    //     let rowIndex = nextProps.timetable.edited[i]
    //     let trip = nextProps.timetable.trips[rowIndex]
    //     if (trip) {
    //       trips.push(trip)
    //     }
    //   }
    // }
  }
  // shouldComponentUpdate (nextProps) {
  //   return true
  // }
  offsetRows (rowIndexes, offsetAmount) {
    let newRows = [...this.props.timetable.trips]
    let editedRows = []
    console.log(`Offsetting ${rowIndexes.length} rows by ${offsetAmount} seconds`)
    for (var i = 0; i < rowIndexes.length; i++) {
      editedRows.push(rowIndexes[i])
      for (var j = 0; j < this.props.timetable.columns.length; j++) {
        let col = this.props.timetable.columns[j]
        let path = `${rowIndexes[i]}.${col.key}`
        if (isTimeFormat(col.type)) {
          let currentVal = objectPath.get(newRows, path)
          let value = currentVal + offsetAmount % 86399 // ensure seconds does not exceed 24 hours
          objectPath.set(newRows, path, value)
          // this.props.updateCellValue(value, i, path)
        }
      }
    }
    let stateUpdate = {
      data: {$set: newRows},
      edited: {$push: editedRows}
    }
    this.setState(update(this.state, stateUpdate))
  }
  saveEditedTrips (pattern, activeScheduleId) {
    let trips = []
    let tripIndexes = []
    for (var i = 0; i < this.props.timetable.edited.length; i++) {
      let rowIndex = this.props.timetable.edited[i]
      if (tripIndexes.indexOf(rowIndex) === -1) {
        let trip = this.props.timetable.trips[rowIndex]
        if (trip) {
          trips.push(trip)
          tripIndexes.push(rowIndex)
        }
      }
    }
    this.props.saveTripsForCalendar(this.props.feedSource.id, pattern, activeScheduleId, trips)
      .then((errorIndexes) => {
        console.log('errors for trips', errorIndexes)
        let edited = []
        for (var i = 0; i < errorIndexes.length; i++) {
          edited.push(this.props.timetable.edited[errorIndexes[i]])
        }
        console.log(edited)
        let stateUpdate = {
          edited: {$set: edited}
        }
        this.setState(update(this.state, stateUpdate))
      })
  }
  isDataValid (col, value, previousValue) {
    if (isTimeFormat(col.type)) {
      return value && value >= 0 && value < previousValue
    } else {
      return true
    }
  }
  render () {
    const { feedSource, activePattern, activeSchedule } = this.props

    const panelStyle = {
      backgroundColor: 'white',
      paddingRight: '5px',
      paddingLeft: '5px'
    }
    const HEADER_HEIGHT = 118
    return (
      <div
        style={panelStyle}
        className='timetable-editor'
      >
        <TimetableHeader
          activePattern={activePattern}
          removeSelectedRows={() => this.removeSelectedRows()}
          offsetRows={(rowIndexes, offsetAmount) => this.offsetRows(rowIndexes, offsetAmount)}
          addNewRow={(blank, scroll) => this.addNewRow(blank, scroll)}
          saveEditedTrips={(pattern, scheduleId) => this.saveEditedTrips(pattern, scheduleId)}
          {...this.props} />
        {activeSchedule
          ? <Timetable
            style={{height: `${this.state.height - HEADER_HEIGHT - 50}px`}}
            constructNewRow={(clone) => this.constructNewRow(clone)}
            addNewRow={(blank, scroll) => this.addNewRow(blank, scroll)}
            toggleRowSelection={(rowIndex) => this.props.toggleRowSelection(rowIndex)}
            toggleAllRows={(select) => this.props.toggleAllRows(select)}
            selected={this.props.timetable.selected}
            scrollToRow={this.state.scrollToRow}
            scrollToColumn={this.state.scrollToColumn}
            activePattern={activePattern}
            data={this.props.timetable.trips}
            columns={this.props.timetable.columns}
            {...this.props} />
          : <p className='lead text-center'>
            {activePattern
              ? <span>
                Choose a calendar to edit timetables or
                {' '}
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    this.props.setActiveEntity(feedSource.id, 'calendar', {id: 'new'})
                  }}
                >create a new one</a>.
              </span>
              : <span>Choose a trip pattern.</span>
            }
          </p>
        }
      </div>
    )
  }
}
