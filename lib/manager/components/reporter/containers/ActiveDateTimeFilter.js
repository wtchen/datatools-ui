// @flow

import {connect} from 'react-redux'

import DateTimeFilter from '../components/DateTimeFilter'
import {updateDateTimeFilter} from '../../../../gtfs/actions/filter'

import type {AppState} from '../../../../types/reducers'

type Props = {
  onChange?: (any) => void
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    dateTime: state.gtfs.filter.dateTimeFilter
  }
}

const mapDispatchToProps = {
  updateDateTimeFilter
}

const ActiveDateTimeFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(DateTimeFilter)

export default ActiveDateTimeFilter
