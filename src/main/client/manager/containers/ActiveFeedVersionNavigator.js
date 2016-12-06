import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import FeedVersionNavigator from '../components/FeedVersionNavigator'
import {
  deleteFeedVersion,
  downloadFeedViaToken,
  fetchValidationResult,
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
  let routeVersionIndex = parseInt(ownProps.routeParams.feedVersionIndex, 10)
  let hasVersionIndex = typeof ownProps.routeParams.feedVersionIndex !== 'undefined'

  if (ownProps.feedSource && typeof ownProps.feedSource.feedVersions !== 'undefined') {
    if ((hasVersionIndex && isNaN(routeVersionIndex)) ||
        routeVersionIndex > ownProps.feedSource.feedVersions.length ||
        routeVersionIndex < 0) {
      console.log(`version index ${routeVersionIndex} is invalid`)

      // CANNOT use browserHistory.push in middle of state transition
      // browserHistory.push(`/feed/${feedSourceId}`)
      window.location.href = `/feed/${ownProps.feedSource.id}`
    } else {
      feedVersionIndex = hasVersionIndex
        ? routeVersionIndex
        : ownProps.feedSource.feedVersions.length
    }
  }

  return {
    feedVersionIndex,
    versionSection: ownProps.routeParams.subpage
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
    createDeploymentFromFeedSource: (feedSource) => {
      dispatch(createDeploymentFromFeedSource(feedSource))
      .then((deployment) => {
        browserHistory.push(`/deployment/${deployment.id}`)
      })
    },
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
    fetchValidationResult: (feedVersion, isPublic) => {
      dispatch(fetchValidationResult(feedVersion, isPublic))
    },
    publishFeedVersion: (feedVersion) => {
      dispatch(publishFeedVersion(feedVersion))
      // .then(() => {
      //   dispatch(fetchFeedSource(feedVersion.feedSource.id, true, true))
      // })
    }
  }
}

const ActiveFeedVersionNavigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedVersionNavigator)

export default ActiveFeedVersionNavigator
