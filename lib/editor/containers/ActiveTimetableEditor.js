// @flow

import { connect } from 'react-redux'

import {
  addNewTrip,
  deleteTripsForCalendar,
  fetchCalendarTripCountsForPattern,
  offsetRows,
  removeTrips,
  saveTripsForCalendar,
  setActiveCell,
  setOffset,
  setScrollIndexes,
  toggleAllRows,
  toggleDepartureTimes,
  toggleRowSelection,
  updateCellValue
} from '../actions/trip'
import TimetableEditor from '../components/timetable/TimetableEditor'
import {getTableById} from '../util/gtfs'
import {getTripCounts} from '../selectors'
import {getTimetableColumns, getTripValidationErrors} from '../selectors/timetable'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: {}) => {
  const {active, tables} = state.editor.data
  const {
    subEntityId: activePatternId,
    subSubEntityId: activeScheduleId
  } = active
  const {timetable} = state.editor
  const tripCounts = getTripCounts(state)
  const columns = getTimetableColumns(state)
  const tripValidationErrors = getTripValidationErrors(state)
  const {subEntity: activePattern} = active
  const activeSchedule = getTableById(tables, 'calendar')
    .find(c => c.service_id === activeScheduleId)
  return {
    activePatternId,
    activeScheduleId,
    activePattern,
    activeSchedule,
    columns,
    tableData: tables,
    timetable,
    tripCounts,
    tripValidationErrors
  }
}

const mapDispatchToProps = {
  // NOTE: fetchTripsForCalendar is mapped to props in ActiveGtfsEditor where it
  // is used to fetch trips
  saveTripsForCalendar,
  deleteTripsForCalendar,
  fetchCalendarTripCountsForPattern,
  // TIMETABLE FUNCTIONS
  updateCellValue,
  setActiveCell,
  setScrollIndexes,
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
