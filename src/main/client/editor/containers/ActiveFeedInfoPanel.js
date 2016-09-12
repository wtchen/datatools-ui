import { connect } from 'react-redux'

import { createSnapshot, fetchSnapshots, restoreSnapshot } from '../actions/snapshots'
import { displayRoutesShapefile } from '../actions/editor'
import FeedInfoPanel from '../components/FeedInfoPanel'

const mapStateToProps = (state, ownProps) => { return { } }

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createSnapshot: (feedSource, name, comment) => { dispatch(createSnapshot(feedSource, name, comment)) },
    getSnapshots: (feedSource) => { dispatch(fetchSnapshots(feedSource)) },
    restoreSnapshot: (feedSource, snapshot) => { dispatch(restoreSnapshot(feedSource, snapshot)) },
    displayRoutesShapefile: (feedSource, file) => { dispatch(displayRoutesShapefile(feedSource, file)) }
  }
}

const ActiveFeedInfoPanel = connect(mapStateToProps, mapDispatchToProps)(FeedInfoPanel)

export default ActiveFeedInfoPanel
