import React from 'react'
import { connect } from 'react-redux'

import PatternLayout from '../components/PatternLayout'
import { patternRouteFilterChange, patternDateTimeFilterChange } from '../../../../gtfs/actions/patterns'
import { stopPatternFilterChange } from '../../../../gtfs/actions/stops'
import { fetchRoutes } from '../../../../gtfs/actions/routes'

const mapStateToProps = (state, ownProps) => {
  return {
    routes: state.gtfs.routes,
    patterns: state.gtfs.patterns
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
    patternRouteFilterChange: (newValue) => {
      dispatch(patternRouteFilterChange(feedId, newValue))
    },
    viewStops: (row) => {
      dispatch(stopPatternFilterChange(feedId, row))
      ownProps.selectTab('stops')
    },
    patternDateTimeFilterChange: (props) => {
      dispatch(patternDateTimeFilterChange(feedId, props))
    },
  }
}

const Patterns = connect(
  mapStateToProps,
  mapDispatchToProps
)(PatternLayout)

export default Patterns
