// @flow

import {connect} from 'react-redux'

import {
  createDisplay,
  createSign,
  deleteSign,
  fetchRtdSigns,
  saveSign
} from '../actions/signs'
import {
  addActiveEntity,
  deleteActiveEntity,
  toggleConfigForDisplay,
  updateActiveEntity,
  updateActiveSignProperty
} from '../actions/activeSign'
import SignEditor from '../components/SignEditor'
import {getFeedsForPermission} from '../../common/util/permissions'
import {getActiveFeeds} from '../../gtfs/selectors'
import {fetchProjects} from '../../manager/actions/projects'
import {getActiveProject} from '../../manager/selectors'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    sign: state.signs.active,
    activeFeeds: getActiveFeeds(state),
    project: getActiveProject(state),
    user: state.user,
    editableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'edit-etid'),
    permissionFilter: state.gtfs.filter.permissionFilter,
    publishableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'approve-etid')
  }
}

const mapDispatchToProps = {
  addActiveEntity,
  createDisplay,
  createSign,
  deleteActiveEntity,
  deleteSign,
  fetchProjects,
  fetchRtdSigns,
  saveSign,
  toggleConfigForDisplay,
  updateActiveEntity,
  updateActiveSignProperty
}

const ActiveSignEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignEditor)

export default ActiveSignEditor
