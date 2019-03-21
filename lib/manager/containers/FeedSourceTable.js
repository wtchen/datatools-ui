// @flow

import {connect} from 'react-redux'

import FeedSourceTable from '../components/FeedSourceTable'
import {feedFilterOptions, feedSortOptions} from '../util'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  onNewFeedSourceClick: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {filter, isFetching, sort} = state.projects
  const {project} = ownProps
  const isNotAdmin = !user.permissions ||
    !user.permissions.isProjectAdmin(project.id, project.organizationId)
  const feedSources = project.feedSources ? project.feedSources : []
  const filteredFeedSources = feedSources
    // filter by name if needed
    .filter(feedSource => {
      // make constant so flow is happy
      const _searchText = filter.searchText
      return _searchText
        ? feedSource.name.toLowerCase().includes(
          _searchText.toLowerCase()
        )
        : true
    })
    .filter(feedFilterOptions[filter.filter || 'all'])
    .sort(feedSortOptions[sort])

  return {
    comparisonColumn: filter.feedSourceTableComparisonColumn,
    feedSources,
    filteredFeedSources,
    isFetching,
    isNotAdmin,
    sort,
    user
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(FeedSourceTable)
