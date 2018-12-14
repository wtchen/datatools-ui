// @flow

import { connect } from 'react-redux'

import {setActiveEntity} from '../actions/active'
import {
  addNewTrip,
  deleteTripsForCalendar,
  fetchCalendarTripCountsForPattern,
  fetchTripsForCalendar,
  offsetRows,
  removeTrips,
  // saveNewTrip,
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
import {findProjectByFeedSource} from '../../manager/util'
import {getTripCounts} from '../selectors'
import {getTimetableColumns} from '../selectors/timetable'

import type {AppState, RouteParams} from '../../types/reducers'

export type Props = {
  route: any,
  routeParams: RouteParams,
  showConfirmModal: any
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {active, tables} = state.editor.data
  const {
    subEntityId: activePatternId,
    subSubEntityId: activeScheduleId
  } = active
  const {timetable} = state.editor
  const {feedSourceId} = ownProps.routeParams
  const project = findProjectByFeedSource(state.projects.all, feedSourceId)
  const feedSource = project && project.feedSources && project.feedSources.find(fs => fs.id === feedSourceId)
  const tripCounts = getTripCounts(state)
  // $FlowFixMe seems like reselect flow-typed library should work, but it doesn't
  const columns = getTimetableColumns(state)
  // $FlowFixMe TODO: write comment what this code is doing
  timetable.columns = columns
  const {subEntity: activePattern} = active
  const activeSchedule = getTableById(tables, 'calendar')
    .find(c => c.service_id === activeScheduleId)
  const timetableStatus = state.editor.timetable.status
  return {
    activePatternId,
    activeScheduleId,
    activePattern,
    activeSchedule,
    feedSource,
    tableData: tables,
    timetable,
    timetableStatus,
    tripCounts
  }
}

const mapDispatchToProps = {
  addNewTrip,
  deleteTripsForCalendar,
  fetchCalendarTripCountsForPattern,
  fetchTripsForCalendar,
  offsetRows,
  removeTrips,
  saveTripsForCalendar,
  setActiveCell,
  setActiveEntity,
  setOffset,
  setScrollIndexes,
  toggleAllRows,
  toggleDepartureTimes,
  toggleRowSelection,
  updateCellValue
}

const ActiveTimetableEditor = connect(mapStateToProps, mapDispatchToProps)(TimetableEditor)

export default ActiveTimetableEditor
