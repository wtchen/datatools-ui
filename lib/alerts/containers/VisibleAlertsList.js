import { connect } from 'react-redux'

import { editAlert, deleteAlert } from '../actions/alerts'
import { setVisibilitySearchText, setVisibilityFilter, setAlertAgencyFilter, setAlertSort } from '../actions/visibilityFilter'

import AlertsList from '../components/AlertsList'

import { getFeedsForPermission } from '../../common/util/permissions'
import {getActiveProject} from '../../manager/selectors'
import {getVisibleAlerts} from '../selectors'
import { FILTERS, filterAlertsByCategory } from '../util'

const mapStateToProps = (state, ownProps) => {
  // TODO: add filter count to receive alerts reducer
  const filterCounts = {}
  FILTERS.map(f => {
    filterCounts[f] = filterAlertsByCategory(state.alerts.all, f).length
  })
  return {
    isFetching: state.alerts.isFetching,
    alerts: getVisibleAlerts(state),
    visibilityFilter: state.alerts.filter,
    feeds: getActiveProject(state) && getActiveProject(state).feedSources ? getActiveProject(state).feedSources : [],
    editableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'edit-alert'),
    publishableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'approve-alert'),
    filterCounts
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onEditClick: (alert) => dispatch(editAlert(alert)),
    onDeleteClick: (alert) => dispatch(deleteAlert(alert)),
    searchTextChanged: (text) => dispatch(setVisibilitySearchText(text)),
    visibilityFilterChanged: (filter) => dispatch(setVisibilityFilter(filter)),
    agencyFilterChanged: (agency) => dispatch(setAlertAgencyFilter(agency)),
    sortChanged: (sort) => dispatch(setAlertSort(sort))
  }
}

const VisibleAlertsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertsList)

export default VisibleAlertsList
