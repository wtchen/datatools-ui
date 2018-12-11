// @flow

import { connect } from 'react-redux'

import {
  createAlert,
  deleteAlert,
  onAlertEditorMount,
  saveAlert,
  setActiveAlert
} from '../actions/alerts'
import {
  setActiveProperty,
  setActivePublished,
  addActiveEntity,
  deleteActiveEntity,
  updateActiveEntity
} from '../actions/activeAlert'
import AlertEditor from '../components/AlertEditor'
import { getFeedsForPermission } from '../../common/util/permissions'
import {getActiveFeeds} from '../../gtfs/selectors'
import {getActiveProject} from '../../manager/selectors'

import type {AppState, RouterProps} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: RouterProps) => {
  return {
    activeFeeds: getActiveFeeds(state),
    alert: state.alerts.active,
    editableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'edit-alert'),
    permissionFilter: state.gtfs.filter.permissionFilter,
    project: getActiveProject(state),
    publishableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'approve-alert'),
    user: state.user
  }
}

const mapDispatchToProps = {
  addActiveEntity,
  createAlert,
  deleteActiveEntity,
  deleteAlert,
  onAlertEditorMount,
  saveAlert,
  setActiveAlert,
  setActiveProperty,
  setActivePublished,
  updateActiveEntity
}

const ActiveAlertEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertEditor)

export default ActiveAlertEditor
