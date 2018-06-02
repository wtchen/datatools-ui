// @flow

import { connect } from 'react-redux'

import TimetableLayout from '../components/TimetableLayout'
import { fetchRoutes } from '../../../../gtfs/actions/routes'
import {
  timetablePatternFilterChange,
  timetableRouteFilterChange,
  timetableServiceFilterChange,
  timetableShowArrivalToggle,
  timetableTimepointToggle
} from '../../../../gtfs/actions/timetables'
import {getTimetableData} from '../../../selectors'

const mapStateToProps = (state, ownProps) => {
  const {
    gtfs: {
      filter: {
        patternFilter,
        routeFilter,
        serviceFilter,
        showArrivals,
        timepointFilter
      },
      patterns,
      routes,
      services,
      timetables
    }
  } = state
  return {
    patternFilter,
    patterns,
    routeFilter,
    routes,
    serviceFilter,
    services,
    showArrivals,
    timepointFilter,
    timetables,
    timetableTableData: getTimetableData(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {namespace} = ownProps.version
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(namespace))
      }
    },
    routeFilterChange: (newValue) => {
      dispatch(timetableRouteFilterChange(namespace, newValue))
    },
    patternFilterChange: (newValue) => {
      dispatch(timetablePatternFilterChange(namespace, newValue))
    },
    serviceFilterChange: (newValue) => {
      dispatch(timetableServiceFilterChange(namespace, newValue))
    },
    showArrivalsToggle: () => { dispatch(timetableShowArrivalToggle(namespace)) },
    timepointFilterToggle: () => { dispatch(timetableTimepointToggle(namespace)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimetableLayout)
