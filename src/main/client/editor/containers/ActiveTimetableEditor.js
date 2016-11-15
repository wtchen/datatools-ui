import { connect } from 'react-redux'
import {
  saveTripsForCalendar,
  deleteTripsForCalendar,
  updateCellValue,
  toggleRowSelection,
  toggleAllRows,
  toggleDepartureTimes,
  addNewTrip,
  setOffset
} from '../actions/trip'

import TimetableEditor from '../components/TimetableEditor'

const mapStateToProps = (state, ownProps) => {
  const activePattern = ownProps.route && ownProps.route.tripPatterns ? ownProps.route.tripPatterns.find(p => p.id === ownProps.activePatternId) : null
  const activeSchedule = ownProps.tableData.calendar ? ownProps.tableData.calendar.find(c => c.id === ownProps.activeScheduleId) : null
  return {
    activePattern,
    activeSchedule
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // NOTE: fetchTripsForCalendar is handled in ActiveGtfsEditor where it is used to fetch trips
    saveTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => {
      return dispatch(saveTripsForCalendar(feedSourceId, pattern, calendarId, trips))
    },
    deleteTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => {
      return dispatch(deleteTripsForCalendar(feedSourceId, pattern, calendarId, trips))
    },

    // TIMETABLE FUNCTIONS
    updateCellValue: (value, rowIndex, key) => dispatch(updateCellValue(value, rowIndex, key)),
    addNewTrip: (trip) => dispatch(addNewTrip(trip)),
    toggleAllRows: (select) => dispatch(toggleAllRows(select)),
    toggleRowSelection: (rowIndex) => dispatch(toggleRowSelection(rowIndex)),
    toggleDepartureTimes: () => dispatch(toggleDepartureTimes()),
    setOffset: (seconds) => dispatch(setOffset(seconds))
  }
}

const ActiveTimetableEditor = connect(mapStateToProps, mapDispatchToProps)(TimetableEditor)

export default ActiveTimetableEditor
