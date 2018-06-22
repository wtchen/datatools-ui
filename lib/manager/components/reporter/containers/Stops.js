// @flow

import { connect } from 'react-redux'

import StopLayout from '../components/StopLayout'
import { updatePatternFilter } from '../../../../gtfs/actions/filter'
import {
  patternDateTimeFilterChange,
  patternRouteFilterChange
} from '../../../../gtfs/actions/patterns'
import { fetchRoutes } from '../../../../gtfs/actions/routes'
import { getFilteredStops } from '../../../selectors'

import type {Pattern} from '../../../../gtfs/reducers/patterns'
import type {Route} from '../../../../gtfs/reducers/routes'
import type {AppState, dispatchFn} from '../../../../types'

const mapStateToProps = (state: AppState, ownProps) => {
  const {
    gtfs: {
      filter: {
        patternFilter,
        routeFilter
      },
      patterns: {
        data: {
          patterns
        }
      },
      routes: {
        allRoutes: routes
      }
    }
  } = state

  return {
    patternFilter,
    patterns,
    routeFilter,
    routes,
    stops: getFilteredStops(state)
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
    dateTimeFilterChange: () => {
      dispatch(patternDateTimeFilterChange(namespace))
    },
    patternFilterChange: (pattern: ?Pattern) => {
      dispatch(updatePatternFilter(pattern && pattern.pattern_id))
    },
    routeFilterChange: (route: ?Route) => {
      dispatch(patternRouteFilterChange(namespace, route && route.route_id))
    }
  }
}

const Stops = connect(
  mapStateToProps,
  mapDispatchToProps
)(StopLayout)

export default Stops
