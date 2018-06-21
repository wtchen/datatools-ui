// @flow

import { connect } from 'react-redux'

import StopLayout from '../components/StopLayout'
import {
  stopDateTimeFilterChange,
  stopPatternFilterChange,
  stopRouteFilterChange
} from '../../../../gtfs/actions/stops'
import { fetchRoutes } from '../../../../gtfs/actions/routes'

import type {AppState, dispatchFn} from '../../../../types'

const mapStateToProps = (state: AppState, ownProps) => {
  const {
    gtfs: {
      filter: {
        dateTimeFilter: dateTime,
        patternFilter,
        routeFilter
      },
      patterns,
      routes: {
        allRoutes: routes
      },
      stops
    }
  } = state

  return {
    stops,
    routes,
    routeFilter,
    patterns,
    patternFilter,
    dateTime
  }
}

const mapDispatchToProps = (dispatch: dispatchFn, ownProps) => {
  const {namespace} = ownProps.version
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(namespace))
      }
    },
    routeFilterChange: (newValue) => {
      dispatch(stopRouteFilterChange(namespace, newValue))
    },
    patternFilterChange: (newValue) => {
      dispatch(stopPatternFilterChange(namespace, newValue))
    },
    stopDateTimeFilterChange: (props) => {
      dispatch(stopDateTimeFilterChange(namespace, props))
    }
  }
}

const Stops = connect(
  mapStateToProps,
  mapDispatchToProps
)(StopLayout)

export default Stops
