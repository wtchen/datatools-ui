// @flow

import {connect} from 'react-redux'

import FeedVersionNavigator from '../components/version/FeedVersionNavigator'
import {
  runFetchFeed
} from '../actions/feeds'
import {
  deleteFeedVersion,
  downloadFeedViaToken,
  fetchGTFSEntities,
  fetchValidationErrors,
  fetchValidationIssueCount,
  publishFeedVersion,
  renameFeedVersion,
  setVersionIndex,
  uploadFeed
} from '../actions/versions'
import {postNoteForFeedVersion, fetchNotesForFeedVersion} from '../actions/notes'
import {createDeploymentFromFeedSource} from '../../manager/actions/deployments'
import {loadFeedVersionForEditing} from '../../editor/actions/snapshots'
import {downloadGtfsPlusFeed} from '../../gtfsplus/actions/gtfsplus'

import type {Feed, Project} from '../../types'
import type {AppState, RouteParams} from '../../types/reducers'

export type Props = {
  deleteDisabled?: boolean,
  disabled?: boolean,
  editDisabled?: boolean,
  feedSource: Feed,
  isPublic?: boolean,
  project?: Project,
  routeParams: RouteParams,
  versionIndex?: number
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  let feedVersionIndex
  const {routeParams, feedSource} = ownProps
  const {feedVersions} = feedSource
  const {feedVersionIndex: fvi, subpage} = routeParams
  const routeVersionIndex = parseInt(fvi, 10)
  const hasVersionIndex = typeof fvi !== 'undefined'
  let versionIndexDoesNotExist = false
  if (feedSource && typeof feedVersions !== 'undefined') {
    if ((hasVersionIndex && isNaN(routeVersionIndex)) ||
        routeVersionIndex > feedVersions.length ||
        routeVersionIndex < 0) {
      versionIndexDoesNotExist = true
    } else {
      feedVersionIndex = hasVersionIndex
        ? routeVersionIndex
        : feedVersions.length
    }
  }
  const {gtfs} = state
  const hasVersions = feedVersions && feedVersions.length > 0
  const sortedVersions = (hasVersions && feedVersions)
    ? feedVersions.sort((a, b) => {
      if (a.updated < b.updated) return -1
      if (a.updated > b.updated) return 1
      return 0
    })
    : []

  let version

  if (
    hasVersions &&
    feedVersions &&
    typeof feedVersionIndex === 'number' &&
    feedVersions.length >= feedVersionIndex
  ) {
    version = sortedVersions[feedVersionIndex - 1]
  }
  return {
    gtfs,
    hasVersions,
    feedVersionIndex,
    sortedVersions,
    user: state.user,
    version,
    versionIndexDoesNotExist,
    versionSection: subpage
  }
}

const mapDispatchToProps = {
  createDeploymentFromFeedSource,
  deleteFeedVersion,
  downloadFeedViaToken,
  downloadGtfsPlusFeed,
  fetchGTFSEntities,
  fetchNotesForFeedVersion,
  fetchValidationErrors,
  fetchValidationIssueCount,
  loadFeedVersionForEditing,
  postNoteForFeedVersion,
  publishFeedVersion,
  renameFeedVersion,
  runFetchFeed,
  setVersionIndex,
  uploadFeed
}

const ActiveFeedVersionNavigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedVersionNavigator)

export default ActiveFeedVersionNavigator
