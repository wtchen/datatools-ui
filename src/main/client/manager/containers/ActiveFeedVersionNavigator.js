import { connect } from 'react-redux'

import FeedVersionNavigator from '../components/FeedVersionNavigator'

import {
  deleteFeedVersion,
  downloadFeedViaToken,
  fetchNotesForFeedVersion,
  fetchValidationResult,
  postNoteForFeedVersion,
  renameFeedVersion
} from '../actions/feeds'

import { loadFeedVersionForEditing } from '../../editor/actions/snapshots'
import { downloadGtfsPlusFeed } from '../../gtfsplus/actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
  let feedVersionIndex
  let routeVersionIndex = parseInt(ownProps.routeParams.feedVersionIndex, 10)
  let hasVersionIndex = typeof ownProps.routeParams.feedVersionIndex !== 'undefined'

  if (ownProps.feedSource && typeof ownProps.feedSource.feedVersions !== 'undefined') {
    if ((hasVersionIndex && isNaN(routeVersionIndex)) ||
        routeVersionIndex > ownProps.feedSource.feedVersions.length ||
        routeVersionIndex < 0) {
      console.log(`version index ${routeVersionIndex} is invalid`)
      // cannot use browserHistory.push in middle of state transition
      // browserHistory.push(`/feed/${feedSourceId}`)
      window.location.href = `/feed/${ownProps.feedSource.id}`
    } else {
      feedVersionIndex = hasVersionIndex
        ? routeVersionIndex
        : ownProps.feedSource.feedVersions.length
    }
  }

  return { feedVersionIndex }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadFeedVersionForEditing: (feedVersion) => {
      dispatch(loadFeedVersionForEditing(feedVersion))
    },
    deleteFeedVersionConfirmed: (feedVersion) => {
      dispatch(deleteFeedVersion(feedVersion))
    },
    downloadFeedClicked: (feedVersion, isPublic) => {
      dispatch(downloadFeedViaToken(feedVersion, isPublic))
    },
    feedVersionRenamed: (feedVersion, name) => {
      dispatch(renameFeedVersion(feedVersion, name))
    },
    gtfsPlusDataRequested: (feedVersion) => {
      dispatch(downloadGtfsPlusFeed(feedVersion.id))
    },
    newNotePostedForVersion: (feedVersion, note) => {
      dispatch(postNoteForFeedVersion(feedVersion, note))
    },
    notesRequestedForVersion: (feedVersion) => {
      dispatch(fetchNotesForFeedVersion(feedVersion))
    },
    validationResultRequested: (feedVersion, isPublic) => {
      dispatch(fetchValidationResult(feedVersion, isPublic))
    }
  }
}

const ActiveFeedVersionNavigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedVersionNavigator)

export default ActiveFeedVersionNavigator
