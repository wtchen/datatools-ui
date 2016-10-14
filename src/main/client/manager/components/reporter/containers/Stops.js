import React from 'react'
import { connect } from 'react-redux'

import StopLayout from '../components/StopLayout'
import { fetchPatterns } from '../../../../gtfs/actions/patterns'
import { fetchStops, stopPatternFilterChange, stopRouteFilterChange, stopDateTimeFilterChange } from '../../../../gtfs/actions/stops'
import { fetchRoutes } from '../../../../gtfs/actions/routes'


const mapStateToProps = (state, ownProps) => {
  return {
    stops: state.gtfs.stops,
    routes: state.gtfs.routes,
    patterns: state.gtfs.patterns,
    dateTime: state.gtfs.filter.dateTimeFilter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedId = ownProps.version.feedSource.id
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(feedId))
      }
      // if(!initialProps.patterns.fetchStatus.fetched) {
      //   dispatch(fetchPatterns(feedId, null))
      // }
    },
    stopRouteFilterChange: (newValue) => {
      dispatch(stopRouteFilterChange(feedId, newValue))
    },
    stopPatternFilterChange: (newValue) => {
      dispatch(stopPatternFilterChange(feedId, newValue))
    },
    stopDateTimeFilterChange: (props) => {
      dispatch(stopDateTimeFilterChange(feedId, props))
    },
    // viewStops: (row) => {
    //   dispatch(stopPatternFilterChange(feedId, row))
    //   dispatch(ownProps.selectTab('stops'))
    // }
  }
}

const Stops = connect(
  mapStateToProps,
  mapDispatchToProps
)(StopLayout)

export default Stops
