import React from 'react'
import { connect } from 'react-redux'

import GtfsMap from '../components/GtfsMap'
import { fetchPatterns } from '../actions/patterns'
import { clearGtfsElements, refreshGtfsElements } from '../actions/general'
import { fetchStops, stopPatternFilterChange, stopRouteFilterChange, stopDateTimeFilterChange } from '../actions/stops'
import { fetchRoutes } from '../actions/routes'
import { updateMapState } from '../actions/filter'
import { fetchFeedVersionIsochrones } from '../../manager/actions/feeds'


const mapStateToProps = (state, ownProps) => {
  return {
    stops: state.gtfs.stops.data,
    routes: state.gtfs.routes.data,
    patterns: state.gtfs.patterns.data,
    routing: state.routing.locationBeforeTransitions && state.routing.locationBeforeTransitions.pathname,
    dateTime: state.gtfs.filter.dateTimeFilter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedId = ownProps.version && ownProps.version.id.replace('.zip', '')
  return {
    onComponentMount: (initialProps) => {
      // if (!initialProps.routes.fetchStatus.fetched) {
      //   dispatch(fetchRoutes(feedId))
      // }
      // if (!initialProps.patterns.fetchStatus.fetched) {
      //   dispatch(fetchPatterns(feedId, null))
      // }
    },
    updateMapState: (props) => {
      dispatch(updateMapState(props))
    },
    clearGtfsElements: () => {
      dispatch(clearGtfsElements())
    },
    refreshGtfsElements: (feedIds, entities) => {
      dispatch(refreshGtfsElements(feedIds, entities))
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
    fetchIsochrones: (feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime) => {
      dispatch(fetchFeedVersionIsochrones(feedVersion, fromLat, fromLon, toLat, toLon, date, fromTime, toTime))
    },
    // viewStops: (row) => {
    //   dispatch(stopPatternFilterChange(feedId, row))
    //   dispatch(ownProps.selectTab('stops'))
    // }
  }
}

const ActiveGtfsMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsMap)

export default ActiveGtfsMap
