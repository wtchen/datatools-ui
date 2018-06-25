// @flow

import {connect} from 'react-redux'

import GtfsMap from '../components/GtfsMap'
import {clearGtfsElements, refreshGtfsElements} from '../actions/general'
import {updateMapState} from '../actions/filter'
import {fetchFeedVersionIsochrones} from '../../manager/actions/versions'
import {getFilteredStops} from '../../manager/selectors'

import type {AppState} from '../../types'

const mapStateToProps = (state: AppState, ownProps) => {
  return {
    dateTime: state.gtfs.filter.dateTimeFilter,
    mapState: state.gtfs.filter.map,
    patternFilter: state.gtfs.filter.patternFilter,
    patterns: state.gtfs.patterns.data.patterns,
    routes: state.gtfs.routes.allRoutes.data,
    routing: state.routing.locationBeforeTransitions && state.routing.locationBeforeTransitions.pathname,
    sidebarExpanded: state.ui.sidebarExpanded,
    stops: getFilteredStops(state)
  }
}

const mapDispatchToProps = {
  updateMapState,
  clearGtfsElements,
  refreshGtfsElements,
  fetchIsochrones: fetchFeedVersionIsochrones
}

const ActiveGtfsMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsMap)

export default ActiveGtfsMap
