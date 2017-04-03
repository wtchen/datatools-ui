import { connect } from 'react-redux'

import { editSign, deleteSign } from '../actions/signs'
import { setVisibilitySearchText, setVisibilityFilter } from '../actions/visibilityFilter'
import { getFeedsForPermission } from '../../common/util/permissions'
import SignsList from '../components/SignsList'
import {getActiveProject} from '../../manager/selectors'
import { FILTERS } from '../util'

const getVisibleSigns = (signs, visibilityFilter) => {
  if (!signs) return []
  const visibleSigns = signs.filter(sign =>
    sign.title.toLowerCase().indexOf((visibilityFilter.searchText || '').toLowerCase()) !== -1)
  switch (visibilityFilter.filter) {
    case 'ALL':
      return visibleSigns
    case 'PUBLISHED':
      return visibleSigns.filter(sign => sign.published)
    case 'DRAFT':
      return visibleSigns.filter(sign => !sign.published)
    default:
      return visibleSigns
  }
}

const mapStateToProps = (state, ownProps) => {
  // if (getActiveProject(state) !== null && getActiveProject(state).feeds !== null )
  const filterCounts = {}
  if (!state.signs.isFetching) {
    FILTERS.map(f => {
      filterCounts[f] = getVisibleSigns(state.signs.all, {filter: f}).length
    })
  }
  return {
    isFetching: state.signs.isFetching,
    signs: getVisibleSigns(state.signs.all, state.signs.filter),
    visibilityFilter: state.signs.filter,
    editableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'edit-etid'),
    publishableFeeds: getFeedsForPermission(getActiveProject(state), state.user, 'approve-etid'),
    filterCounts
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onEditClick: (sign) => dispatch(editSign(sign)),
    onDeleteClick: (sign) => dispatch(deleteSign(sign)),
    searchTextChanged: (text) => dispatch(setVisibilitySearchText(text)),
    visibilityFilterChanged: (filter) => dispatch(setVisibilityFilter(filter))
  }
}

const VisibleSignsList = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignsList)

export default VisibleSignsList
