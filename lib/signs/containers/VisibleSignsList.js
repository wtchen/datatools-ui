// @flow

import { connect } from 'react-redux'

import { editSign, deleteSign } from '../actions/signs'
import { setVisibilitySearchText, setVisibilityFilter } from '../actions/visibilityFilter'
import { getFeedsForPermission } from '../../common/util/permissions'
import SignsList from '../components/SignsList'
import {getActiveProject} from '../../manager/selectors'
import {getVisibleSigns} from '../selectors'

import type {AppState} from '../../types/reducers'

export type Props = {}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const activeProject = getActiveProject(state)
  return {
    isFetching: state.signs.isFetching,
    signs: getVisibleSigns(state),
    visibilityFilter: state.signs.filter,
    editableFeeds: getFeedsForPermission(activeProject, state.user, 'edit-etid'),
    publishableFeeds: getFeedsForPermission(activeProject, state.user, 'approve-etid'),
    filterCounts: state.signs.counts
  }
}

const mapDispatchToProps = {
  onEditClick: editSign,
  onDeleteClick: deleteSign,
  searchTextChanged: setVisibilitySearchText,
  visibilityFilterChanged: setVisibilityFilter
}

const VisibleSignsList = connect(mapStateToProps, mapDispatchToProps)(SignsList)

export default VisibleSignsList
