import { connect } from 'react-redux'
import {
  saveTripsForCalendar,
  deleteTripsForCalendar,
  offsetRows,
  updateCellValue,
  toggleRowSelection,
  toggleAllRows,
  toggleDepartureTimes,
  addNewTrip,
  // saveNewTrip,
  removeTrips,
  setOffset
} from '../actions/trip'

import TimetableEditor from '../components/timetable/TimetableEditor'
import {getTableById} from '../util/gtfs'
import {getTimetableColumns} from '../selectors/timetable'

const mapStateToProps = (state, ownProps) => {
  const {active, tables} = state.editor.data
  const {timetable} = state.editor
  const columns = getTimetableColumns(state)
  timetable.columns = columns
  const {subEntity: activePattern} = active
  const activeSchedule = getTableById(tables, 'calendar').find(c => c.service_id === ownProps.activeScheduleId)
  return {
    activePattern,
    activeSchedule,
    timetable
  }
}

const mapDispatchToProps = {
  // NOTE: fetchTripsForCalendar is mapped to props in ActiveGtfsEditor where it is used to fetch trips
  saveTripsForCalendar,
  deleteTripsForCalendar,
  // TIMETABLE FUNCTIONS
  updateCellValue,
  addNewTrip, // : saveNewTrip,
  offsetRows,
  removeTrips,
  toggleAllRows,
  toggleRowSelection,
  toggleDepartureTimes,
  setOffset
}

const ActiveTimetableEditor = connect(mapStateToProps, mapDispatchToProps)(TimetableEditor)

export default ActiveTimetableEditor
