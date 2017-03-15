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
  const {routeParams, feedSource} = ownProps
  const {feedVersions, id} = feedSource
  const {feedVersionIndex: fvi, subpage} = routeParams
  const routeVersionIndex = parseInt(fvi, 10)
  const hasVersionIndex = typeof fvi !== 'undefined'

  if (feedSource && typeof feedVersions !== 'undefined') {
    if ((hasVersionIndex && isNaN(routeVersionIndex)) ||
        routeVersionIndex > feedVersions.length ||
        routeVersionIndex < 0) {
      console.log(`version index ${routeVersionIndex} is invalid`)

      // TODO: CANNOT use browserHistory.push in middle of state transition
      // browserHistory.push(`/feed/${feedSourceId}`)
      window.location.href = `/feed/${id}`
    } else {
      feedVersionIndex = hasVersionIndex
        ? routeVersionIndex
        : feedVersions.length
    }
  }
  const { jobs } = state.status.jobMonitor
  const validationJob = feedVersionIndex >= 1
    ? jobs.find(j => j.type === 'VALIDATE_FEED' && j.feedVersion.id === feedVersions[feedVersionIndex - 1].id)
    : null
  return {
    feedVersionIndex,
    validationJob,
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
