import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import FeedVersionNavigator from '../components/version/FeedVersionNavigator'
import {
  deleteFeedVersion,
  downloadFeedViaToken,
  fetchGTFSEntities,
  fetchValidationErrors,
  fetchValidationIssueCount,
  renameFeedVersion,
  setActiveVersion,
  publishFeedVersion
} from '../actions/versions'
import { postNoteForFeedVersion, fetchNotesForFeedVersion } from '../actions/notes'
import { createDeploymentFromFeedSource } from '../../manager/actions/deployments'
import { loadFeedVersionForEditing } from '../../editor/actions/snapshots'
import { downloadGtfsPlusFeed } from '../../gtfsplus/actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
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
  const sortedVersions = hasVersions
    ? feedVersions.sort((a, b) => {
      if (a.updated < b.updated) return -1
      if (a.updated > b.updated) return 1
      return 0
    })
    : []

  let version

  if (hasVersions && feedVersions.length >= feedVersionIndex) {
    version = sortedVersions[feedVersionIndex - 1]
  }
  return {
    gtfs,
    hasVersions,
    feedVersionIndex,
    sortedVersions,
    version,
    versionIndexDoesNotExist,
    versionSection: subpage
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const publicPrefix = ownProps.isPublic ? '/public' : ''
  return {
    setVersionIndex: (fs, index, push = true) => {
      dispatch(setActiveVersion(fs.feedVersions[index - 1]))

      if (push) {
        browserHistory.push(`${publicPrefix}/feed/${fs.id}/version/${index}`)
      }
    },
    createDeploymentFromFeedSource: (feedSource) => dispatch(createDeploymentFromFeedSource(feedSource)),
    loadFeedVersionForEditing: (payload) => dispatch(loadFeedVersionForEditing(payload)),
    deleteFeedVersionConfirmed: (feedVersion) => dispatch(deleteFeedVersion(feedVersion)),
    downloadFeedClicked: (feedVersion, isPublic) => dispatch(downloadFeedViaToken(feedVersion, isPublic)),
    feedVersionRenamed: (feedVersion, name) => dispatch(renameFeedVersion(feedVersion, name)),
    gtfsPlusDataRequested: (feedVersion) => dispatch(downloadGtfsPlusFeed(feedVersion.id)),
    newNotePostedForVersion: (feedVersion, note) => dispatch(postNoteForFeedVersion(feedVersion, note)),
    notesRequestedForVersion: (feedVersion) => dispatch(fetchNotesForFeedVersion(feedVersion)),
    fetchGTFSEntities: params => dispatch(fetchGTFSEntities(params)),
    fetchValidationIssueCount: (feedVersion) => dispatch(fetchValidationIssueCount(feedVersion)),
    fetchValidationErrors: payload => dispatch(fetchValidationErrors(payload)),
    publishFeedVersion: (feedVersion) => dispatch(publishFeedVersion(feedVersion))
  }
}

const ActiveFeedVersionNavigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedVersionNavigator)

export default ActiveFeedVersionNavigator
