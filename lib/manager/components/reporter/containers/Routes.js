// @flow

import { connect } from 'react-redux'

import RouteLayout from '../components/RouteLayout'
import { fetchRouteDetails } from '../../../../gtfs/actions/routes'
import { patternRouteFilterChange } from '../../../../gtfs/actions/patterns'
import {getRouteData} from '../../../selectors'

import type {AppState} from '../../../../types'

const mapStateToProps = (state: AppState, ownProps) => {
  const {namespace} = ownProps.version
  const {
    gtfs: {
      routes: {
        routeDetails: {
          data,
          fetchStatus
        }
      }
    }
  } = state
  return {
    fetchStatus,
    namespace,
    numRoutes: data ? data.numRoutes : 0,
    routeData: getRouteData(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {namespace} = ownProps.version
  return {
    onComponentMount: (fetched) => {
      if (!fetched) {
        dispatch(fetchRouteDetails(namespace))
      }
    },
    routeDateTimeFilterChange: () => dispatch(fetchRouteDetails(namespace)),
    viewPatterns: (row) => {
      dispatch(patternRouteFilterChange(namespace, row))
      ownProps.selectTab('patterns')
    }
  }
}

const Routes = connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteLayout)

export default Routes
