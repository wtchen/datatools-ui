import { connect } from 'react-redux'
import { fetchSnapshots, restoreSnapshot, deleteSnapshot } from '../actions/snapshots.js'

import EditorFeedSourcePanel from '../components/EditorFeedSourcePanel'

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSnapshots: (feedSource) => { dispatch(fetchSnapshots(feedSource)) },
    restoreSnapshot: (feedSource, snapshot) => { dispatch(restoreSnapshot(feedSource, snapshot)) },
    deleteSnapshot: (feedSource, snapshot) => { dispatch(deleteSnapshot(feedSource, snapshot)) }
  }
}

const ActiveEditorFeedSourcePanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorFeedSourcePanel)

export default ActiveEditorFeedSourcePanel
