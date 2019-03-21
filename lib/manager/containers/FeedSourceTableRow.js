// @flow

import {connect} from 'react-redux'

import {createDeploymentFromFeedSource} from '../actions/deployments'
import {
  createFeedSource,
  deleteFeedSource,
  runFetchFeed,
  updateFeedSource
} from '../actions/feeds'
import {uploadFeed} from '../actions/versions'
import FeedSourceTableRow from '../components/FeedSourceTableRow'

import type {Feed, Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  feedSource: Feed,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {projects, user} = state
  const {feedSource, project} = ownProps
  const comparisonColumn = projects.filter.feedSourceTableComparisonColumn
  let comparisonVersion
  if (comparisonColumn === 'DEPLOYED') {
    const comparisonDeployment = project.deployments
      // TODO: pinned deployments
      ? (
        project.deployments.find(deployment => deployment.id === 'PINNED') ||
          (
            project.deployments && project.deployments.length > 0
              ? project.deployments[0]
              : null
          )
      )
      : null

    if (comparisonDeployment) {
      comparisonVersion = comparisonDeployment.feedVersions.find(
        version => version.feedSource.id === feedSource.id
      )
    }
  } else if (comparisonColumn === 'PUBLISHED') {
    if (feedSource.feedVersions) {
      comparisonVersion = feedSource.feedVersions.find(
        version => version.feedSource.id === feedSource.id
      )
    }
  }

  return {
    comparisonColumn,
    comparisonVersion,
    user
  }
}

const mapDispatchToProps = {
  createDeploymentFromFeedSource,
  createFeedSource,
  deleteFeedSource,
  runFetchFeed,
  updateFeedSource,
  uploadFeed
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedSourceTableRow)
