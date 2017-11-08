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
  const {namespace} = ownProps.version
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.routes.fetchStatus.fetched) {
        dispatch(fetchRoutes(namespace))
      }
      // if (!initialProps.patterns.fetchStatus.fetched) {
      //   dispatch(fetchPatterns(namespace, null))
      // }
    },
    patternRouteFilterChange: (newValue) => {
      dispatch(patternRouteFilterChange(namespace, newValue))
    },
    viewStops: (row) => {
      dispatch(stopPatternFilterChange(namespace, row))
      ownProps.selectTab('stops')
    },
    patternDateTimeFilterChange: (props) => {
      dispatch(patternDateTimeFilterChange(namespace, props))
    }
  }
}

const Patterns = connect(
  mapStateToProps,
  mapDispatchToProps
)(PatternLayout)

export default Patterns
