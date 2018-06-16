// @flow

import { connect } from 'react-redux'

import RouteLayout from '../components/RouteLayout'
import { fetchRoutes } from '../../../../gtfs/actions/routes'
import { patternRouteFilterChange } from '../../../../gtfs/actions/patterns'
import {getRouteData} from '../../../selectors'

const mapStateToProps = (state, ownProps) => {
  const {namespace} = ownProps.version
  const {
    gtfs: {
      routes: {
        fetchStatus
      }
    }
  } = state
  return {
    namespace,
    fetchStatus,
    routeData: getRouteData(state)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {namespace} = ownProps.version
  return {
    onComponentMount: (fetched) => {
      if (!fetched) {
        dispatch(fetchRoutes(namespace))
      }
    },
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
