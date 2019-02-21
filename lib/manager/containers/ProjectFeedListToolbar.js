// @flow

import {connect} from 'react-redux'

import {
  downloadFeedForProject,
  fetchFeedsForProject,
  thirdPartySync
} from '../actions/projects'
import {setVisibilitySearchText} from '../actions/visibilityFilter'
import ProjectFeedListToolbar from '../components/ProjectFeedListToolbar'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  onNewFeedSourceClick: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {filter} = state.projects
  return {
    user,
    visibilityFilter: filter
  }
}

const mapDispatchToProps = {
  downloadFeedForProject,
  fetchFeedsForProject,
  setVisibilitySearchText,
  thirdPartySync
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFeedListToolbar)
