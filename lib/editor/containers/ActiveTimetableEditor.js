import { connect } from 'react-redux'
import {
  saveTripsForCalendar,
  deleteTripsForCalendar,
  updateCellValue,
  toggleRowSelection,
  toggleAllRows,
  toggleDepartureTimes,
  addNewTrip,
  removeTrips,
  setOffset
} from '../actions/trip'

import TimetableEditor from '../components/timetable/TimetableEditor'

const mapStateToProps = (state, ownProps) => {
  const activePattern = state.editor.data.active.subEntity
  const activeSchedule = state.editor.data.tables.calendar ? state.editor.data.tables.calendar.find(c => c.id === ownProps.activeScheduleId) : null
  return {
    activePattern,
    activeSchedule,
    timetable: state.editor.timetable
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // NOTE: fetchTripsForCalendar is handled in ActiveGtfsEditor where it is used to fetch trips
    saveTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => dispatch(saveTripsForCalendar(feedSourceId, pattern, calendarId, trips)),
    deleteTripsForCalendar: (feedSourceId, pattern, calendarId, trips) => dispatch(deleteTripsForCalendar(feedSourceId, pattern, calendarId, trips)),

    // TIMETABLE FUNCTIONS
    updateCellValue: (value, rowIndex, key) => dispatch(updateCellValue(value, rowIndex, key)),
    addNewTrip: (trip) => dispatch(addNewTrip(trip)),
    removeTrips: (indexes) => dispatch(removeTrips(indexes)),
    toggleAllRows: (select) => dispatch(toggleAllRows(select)),
    toggleRowSelection: (rowIndex) => dispatch(toggleRowSelection(rowIndex)),
    toggleDepartureTimes: () => dispatch(toggleDepartureTimes()),
    setOffset: (seconds) => dispatch(setOffset(seconds))
  }
}

const ActiveTimetableEditor = connect(mapStateToProps, mapDispatchToProps)(TimetableEditor)

export default ActiveTimetableEditor
