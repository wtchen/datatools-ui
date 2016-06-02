import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { editAlert, deleteAlert } from '../actions/alerts'
import { setVisibilitySearchText, setVisibilityFilter, setAlertAgencyFilter, setAlertSort } from '../actions/visibilityFilter'
import { getFeedId } from '../../common/util/modules'

import AlertsList from '../components/AlertsList'

import { getFeedsForPermission } from '../../common/util/permissions'

const getVisibleAlerts = (alerts, visibilityFilter) => {
  console.log('getting visible alerts', visibilityFilter)
  if (!alerts) return []
  let visibleAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().indexOf((visibilityFilter.searchText || '').toLowerCase()) !== -1)
  let now = moment()

  if (visibilityFilter.feedId && visibilityFilter.feedId !== 'ALL') {
    console.log('filtering alerts by feedId' + visibilityFilter.feedId)
    visibleAlerts = visibleAlerts.filter(alert => alert.affectedEntities.findIndex(ent => getFeedId(ent.agency) === visibilityFilter.feedId) !== -1)
  }

  if (visibilityFilter.sort) {
    console.log('sorting alerts by ' + visibilityFilter.sort.type + ' direction: ' + visibilityFilter.sort.direction)
    visibleAlerts = visibleAlerts.sort((a, b) => {
      var aValue = visibilityFilter.sort.type === 'title' ? a[visibilityFilter.sort.type].toUpperCase() : a[visibilityFilter.sort.type]
      var bValue = visibilityFilter.sort.type === 'title' ? b[visibilityFilter.sort.type].toUpperCase() : b[visibilityFilter.sort.type]
      if(aValue < bValue) return visibilityFilter.sort.direction === 'asc' ? -1 : 1
      if(aValue > bValue) return visibilityFilter.sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }
  else {
    visibleAlerts.sort((a,b) => {
      if(a.id < b.id) return -1
      if(a.id > b.id) return 1
      return 0
    })
  }

  // switch (visibilityFilter.filter) {
  //   case 'ALL':
  //     return visibleAlerts
  //   case 'ACTIVE':
  //     return visibleAlerts.filter(alert =>
  //       moment(alert.start).isBefore(now) && moment(alert.end).isAfter(now))
  //   case 'FUTURE':
  //     return visibleAlerts.filter(alert => moment(alert.start).isAfter(now))
  //   case 'ARCHIVED':
  //     return visibleAlerts.filter(alert => moment(alert.end).isBefore(now))
  //   case 'DRAFT':
  //     return visibleAlerts.filter(alert => !alert.published)
  // }
  return visibleAlerts
}

const mapStateToProps = (state, ownProps) => {
  console.log('all alerts', state.alerts.all)
  // if (state.projects.active !== null && state.projects.active.feeds !== null )
  return {
    isFetching: state.alerts.isFetching,
    alerts: getVisibleAlerts(state.alerts.all, state.alerts.filter),
    visibilityFilter: state.alerts.filter,
    feeds: state.projects.active && state.projects.active.feedSources ? state.projects.active.feedSources : [],
    editableFeeds: getFeedsForPermission(state.projects.active, state.user, 'edit-alert'),
    publishableFeeds: getFeedsForPermission(state.projects.active, state.user, 'approve-alert')
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onEditClick: (alert) => dispatch(editAlert(alert)),
    onDeleteClick: (alert) => dispatch(deleteAlert(alert)),
    searchTextChanged: (text) => dispatch(setVisibilitySearchText(text)),
    visibilityFilterChanged: (filter) => dispatch(setVisibilityFilter(filter)),
    agencyFilterChanged: (agency) => dispatch(setAlertAgencyFilter(agency)),
    sortChanged: (sort) => dispatch(setAlertSort(sort)),
  }
}

const VisibleAlertsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertsList)

export default VisibleAlertsList
