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
  return {}
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
