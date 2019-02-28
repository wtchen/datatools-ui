// @flow

import {connect} from 'react-redux'

import {
  downloadFeedForProject,
  fetchFeedsForProject,
  setFeedSort,
  thirdPartySync,
  toggleFeedTableViewType
} from '../actions/projects'
import {
  setVisibilityFilter,
  setVisibilitySearchText
} from '../actions/visibilityFilter'
import ProjectFeedListToolbar from '../components/ProjectFeedListToolbar'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  onNewFeedSourceClick: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {feedTableViewType, filter, sort} = state.projects
  const {project} = ownProps
  const projectEditDisabled = !user.permissions ||
    !user.permissions.isProjectAdmin(project.id, project.organizationId)
  return {
    feedTableViewType,
    filter,
    projectEditDisabled,
    sort,
    user
  }
}

const mapDispatchToProps = {
  downloadFeedForProject,
  fetchFeedsForProject,
  setFeedSort,
  setVisibilityFilter,
  setVisibilitySearchText,
  thirdPartySync,
  toggleFeedTableViewType
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFeedListToolbar)
