import {connect} from 'react-redux'

import FeedSourceViewer from '../components/FeedSourceViewer'
import {
  onFeedSourceViewerMount,
  deleteFeedSource,
  runFetchFeed,
  updateExternalFeedResource,
  updateFeedSource
} from '../actions/feeds'
import {
  deleteFeedVersion,
  downloadFeedViaToken,
  uploadFeed,
  renameFeedVersion
} from '../actions/versions'
import {
  fetchNotesForFeedSource,
  fetchNotesForFeedVersion,
  postNoteForFeedSource,
  postNoteForFeedVersion
} from '../actions/notes'
import {loadFeedVersionForEditing} from '../../editor/actions/snapshots'
import {downloadGtfsPlusFeed} from '../../gtfsplus/actions/gtfsplus'
import {updateTargetForSubscription} from '../../manager/actions/user'
import {createDeploymentFromFeedSource} from '../../manager/actions/deployments'

const mapStateToProps = (state, ownProps) => {
  const {
    subpage: activeComponent,
    subsubpage: activeSubComponent,
    feedSourceId
  } = ownProps.routeParams
  const {all, isFetching} = state.projects
  const {user} = state
  // Helper function to find feed source.
  const findFeed = feedSource => feedSource.id === feedSourceId
  // Find the containing project
  const project = all
    ? all.find(p => p.feedSources && p.feedSources.findIndex(findFeed) !== -1)
    : null
  // Find the feed source
  const feedSource = project ? project.feedSources.find(findFeed) : null
  return {
    feedSource,
    feedSourceId,
    activeComponent,
    activeSubComponent,
    project,
    user,
    isFetching
  }
}

const mapDispatchToProps = {
  createDeployment: createDeploymentFromFeedSource,
  loadFeedVersionForEditing,
  deleteFeedVersion,
  downloadFeedClicked: downloadFeedViaToken,
  externalPropertyChanged: updateExternalFeedResource,
  feedSourcePropertyChanged: updateFeedSource,
  feedVersionRenamed: renameFeedVersion,
  gtfsPlusDataRequested: downloadGtfsPlusFeed,
  newNotePostedForFeedSource: postNoteForFeedSource,
  newNotePostedForVersion: postNoteForFeedVersion,
  notesRequestedForFeedSource: fetchNotesForFeedSource,
  fetchNotesForFeedVersion,
  onFeedSourceViewerMount,
  fetchFeed: runFetchFeed,
  deleteFeedSource,
  updateUserSubscription: updateTargetForSubscription,
  uploadFeed: uploadFeed
}

const ActiveFeedSourceViewer = connect(mapStateToProps, mapDispatchToProps)(
  FeedSourceViewer
)

export default ActiveFeedSourceViewer
