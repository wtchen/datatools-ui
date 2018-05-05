import { connect } from 'react-redux'

import StopLayout from '../components/StopLayout'
import {
  stopDateTimeFilterChange,
  stopPatternFilterChange,
  stopRouteFilterChange
} from '../../../../gtfs/actions/stops'
import { fetchRoutes } from '../../../../gtfs/actions/routes'

const mapStateToProps = (state, ownProps) => {
  return {
    stops: state.gtfs.stops,
    routes: state.gtfs.routes,
    routeFilter: state.gtfs.filter.routeFilter,
    patterns: state.gtfs.patterns,
    patternFilter: state.gtfs.filter.patternFilter,
    dateTime: state.gtfs.filter.dateTimeFilter
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
