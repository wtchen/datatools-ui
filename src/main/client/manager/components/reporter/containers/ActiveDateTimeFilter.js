import { connect } from 'react-redux'

import DateTimeFilter from '../components/DateTimeFilter'
import { updateDateTimeFilter } from '../../../../gtfs/actions/filter'

const mapStateToProps = (state, ownProps) => {
  return {
    dateTime: state.gtfs.filter.dateTimeFilter
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
    },
    updateDateTimeFilter: (props) => {
      dispatch(updateDateTimeFilter(props))
    }
  }
}

const ActiveDateTimeFilter = connect(
  mapStateToProps,
  mapDispatchToProps
)(DateTimeFilter)

export default ActiveDateTimeFilter
