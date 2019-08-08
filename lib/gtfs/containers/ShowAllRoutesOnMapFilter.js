// @flow

import {connect} from 'react-redux'

import {toggleShowAllRoutesOnMap} from '../actions/shapes'
import ShowAllRoutesOnMapFilter from '../components/ShowAllRoutesOnMapFilter'

import type {AppState} from '../../types/reducers'

export type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
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
