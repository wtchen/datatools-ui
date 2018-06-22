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

import type {Connector} from 'react-redux'

import type {
  Actions,
  ConnectedProps,
  InheritedProps
} from '../components/StopLayout'
import type {AppState, dispatchFn} from '../../../../types'

type OwnProps = InheritedProps & {selectTab: (string) => void}

const mapStateToProps = (state: AppState, ownProps: OwnProps): ConnectedProps => {
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

const mapDispatchToProps = (dispatch: dispatchFn, ownProps: OwnProps): Actions => {
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
    patternFilterChange: (pattern) => {
      dispatch(updatePatternFilter(pattern && pattern.pattern_id))
    },
    routeFilterChange: (route) => {
      dispatch(patternRouteFilterChange(namespace, route && route.route_id))
    }
  }
}

const connnector: Connector<OwnProps, Actions & ConnectedProps & InheritedProps> = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default connnector(StopLayout)
