// @flow

import {connect} from 'react-redux'

import {
  calculateAllStopsOnCellTrip,
  calculateAllStopsOnSelectedTrips,
  calculateSingleStopTime,
  calculateStopOnSelectedTrips,
  calculateStopsWithoutTimesOnCellTrip,
  calculateStopsWithoutTimesOnSelectedTrips,
  closeTimetableContextMenu
} from '../actions/trip'
import ContextMenu from '../components/timetable/ContextMenu'

import type {AppState} from '../../types/reducers'

type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {timetable} = state.editor
  const {activeCell, contextMenu, selected} = timetable
  return {
    activeCell,
    menuState: contextMenu,
    selected
  }
}

const mapDispatchToProps = {
  calculateAllStopsOnCellTrip,
  calculateAllStopsOnSelectedTrips,
  calculateSingleStopTime,
  calculateStopOnSelectedTrips,
  calculateStopsWithoutTimesOnCellTrip,
  calculateStopsWithoutTimesOnSelectedTrips,
  closeTimetableContextMenu
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu)
