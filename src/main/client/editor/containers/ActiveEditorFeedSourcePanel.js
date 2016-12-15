import { connect } from 'react-redux'
import { fetchSnapshots, restoreSnapshot, deleteSnapshot, loadFeedVersionForEditing, downloadSnapshotViaToken } from '../actions/snapshots.js'
import { createFeedVersionFromSnapshot } from '../../manager/actions/versions'

import EditorFeedSourcePanel from '../components/EditorFeedSourcePanel'

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSnapshots: (feedSource) => { dispatch(fetchSnapshots(feedSource)) },
    restoreSnapshot: (feedSource, snapshot) => { dispatch(restoreSnapshot(feedSource, snapshot)) },
    deleteSnapshot: (feedSource, snapshot) => { dispatch(deleteSnapshot(feedSource, snapshot)) },
    downloadSnapshot: (feedSource, snapshot) => { dispatch(downloadSnapshotViaToken(feedSource, snapshot)) },
    exportSnapshotAsVersion: (feedSource, snapshot) => { dispatch(createFeedVersionFromSnapshot(feedSource, snapshot.id)) },
    loadFeedVersionForEditing: (feedVersion) => {
      dispatch(loadFeedVersionForEditing(feedVersion))
    }
  }
}

const ActiveEditorFeedSourcePanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorFeedSourcePanel)

export default ActiveEditorFeedSourcePanel
