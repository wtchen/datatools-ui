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
  const {user} = state
  return {
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
