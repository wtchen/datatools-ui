// @flow

import {connect} from 'react-redux'

import ShowAllRoutesOnMapFilter from '../components/ShowAllRoutesOnMapFilter'
import {toggleShowAllRoutesOnMap} from '../actions/shapes'

import type {dispatchFn} from '../../types'
import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps) => {
  return {
    showAllRoutesOnMap: state.gtfs.filter.showAllRoutesOnMap
  }
}

const mapDispatchToProps = (dispatch: dispatchFn, ownProps) => {
  return {
    toggleShowAllRoutesOnMap: () => dispatch(toggleShowAllRoutesOnMap(
      ownProps.namespace
    ))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowAllRoutesOnMapFilter)
