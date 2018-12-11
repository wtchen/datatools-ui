// @flow

import {connect} from 'react-redux'

import {toggleShowAllRoutesOnMap} from '../actions/shapes'
import ShowAllRoutesOnMapFilter from '../components/ShowAllRoutesOnMapFilter'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps) => {
  return {
    showAllRoutesOnMap: state.gtfs.filter.showAllRoutesOnMap
  }
}

const mapDispatchToProps = {
  toggleShowAllRoutesOnMap
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowAllRoutesOnMapFilter)
