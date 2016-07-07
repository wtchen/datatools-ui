import { connect } from 'react-redux'
import { createSnapshot } from '../actions/snapshots.js'

import FeedInfoPanel from '../components/FeedInfoPanel'

const mapStateToProps = (state, ownProps) => { return { } }

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createSnapshot: (feedSource, name, comment) => { dispatch(createSnapshot(feedSource, name, comment)) }
  }
}

const ActiveFeedInfoPanel = connect(mapStateToProps, mapDispatchToProps)(FeedInfoPanel)

export default ActiveFeedInfoPanel
