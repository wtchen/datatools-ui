import { connect } from 'react-redux'

import { createSnapshot, fetchSnapshots } from '../actions/snapshots.js'
import {
  setActiveGtfsEntity,
} from '../actions/editor.js'
import FeedInfoPanel from '../components/FeedInfoPanel'

const mapStateToProps = (state, ownProps) => { return { } }

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createSnapshot: (feedSource, name, comment) => { dispatch(createSnapshot(feedSource, name, comment)) },
    getSnapshots: (feedSource) => { dispatch(fetchSnapshots(feedSource)) }
  }
}

const ActiveFeedInfoPanel = connect(mapStateToProps, mapDispatchToProps)(FeedInfoPanel)

export default ActiveFeedInfoPanel
