import { connect } from 'react-redux'

import RouteLayout from '../components/RouteLayout'
import { fetchRoutes } from '../../../../gtfs/actions/routes'
import { patternRouteFilterChange } from '../../../../gtfs/actions/patterns'

const mapStateToProps = (state, ownProps) => {
  return {
    routes: state.gtfs.routes
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
