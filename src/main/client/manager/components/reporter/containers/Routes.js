import React from 'react'
import { connect } from 'react-redux'

import RouteLayout from '../components/RouteLayout'
// import { selectTab } from '../../../../gtfs/actions/pageLayout'
import { fetchRoutes } from '../../../../gtfs/actions/routes'
import { patternRouteFilterChange } from '../../../../gtfs/actions/patterns'


const mapStateToProps = (state, ownProps) => {
  return {
    routes: state.gtfs.routes
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const feedId = ownProps.version.feedSource.id
  return {
    onComponentMount: (initialProps) => {
      if(!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(feedId))
      }
    },
    viewPatterns: (row) => {
      dispatch(patternRouteFilterChange(feedId, row))
      ownProps.selectTab('patterns')
    }
  }
}

const Routes = connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteLayout)

export default Routes
