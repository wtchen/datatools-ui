import { connect } from 'react-redux'

import StopLayout from '../components/StopLayout'
import { stopPatternFilterChange, stopRouteFilterChange, stopDateTimeFilterChange } from '../../../../gtfs/actions/stops'
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
  const {namespace} = ownProps.version
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(namespace))
      }
    },
    stopRouteFilterChange: (newValue) => {
      dispatch(stopRouteFilterChange(namespace, newValue))
    },
    stopPatternFilterChange: (newValue) => {
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
