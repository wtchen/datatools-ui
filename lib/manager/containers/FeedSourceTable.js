// @flow

import {connect} from 'react-redux'

import FeedSourceTable from '../components/FeedSourceTable'

import type {Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  onNewFeedSourceClick: () => void,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {isFetching} = state.projects
  const {project} = ownProps
  const isNotAdmin = !user.permissions ||
    !user.permissions.isProjectAdmin(project.id, project.organizationId)
  return {
    isFetching,
    isNotAdmin,
    user
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(FeedSourceTable)
