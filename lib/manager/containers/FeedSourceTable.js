// @flow

import {connect} from 'react-redux'

import FeedSourceTable from '../components/FeedSourceTable'
import {getFilteredFeeds} from '../util'
import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'
import { AUTH0_DISABLED } from '../../common/constants'

export type Props = {
  onNewFeedSourceClick: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {filter, isFetching, sort} = state.projects
  const {project} = ownProps
  const isNotAdmin = !AUTH0_DISABLED && (!user.permissions ||
    !user.permissions.isProjectAdmin(project.id, project.organizationId))
  const feedSources = project.feedSources ? project.feedSources : []

  return {
    comparisonColumn: filter.feedSourceTableComparisonColumn,
    feedSources,
    filteredFeedSources: getFilteredFeeds(
      feedSources,
      filter,
      project,
      sort
    ),
    isFetching,
    isNotAdmin,
    sort,
    user
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(FeedSourceTable)
