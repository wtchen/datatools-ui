import { connect } from 'react-redux'

import { createSnapshot } from '../actions/snapshots.js'
import {
  setActiveGtfsEntity,
} from '../actions/editor.js'
import FeedInfoPanel from '../components/FeedInfoPanel'

const mapStateToProps = (state, ownProps) => { return { } }

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createSnapshot: (feedSource, name, comment) => { dispatch(createSnapshot(feedSource, name, comment)) },
    setActiveGtfsEntity: (feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId) => { dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId)) }
  }
}

const ActiveFeedInfoPanel = connect(mapStateToProps, mapDispatchToProps)(FeedInfoPanel)

export default ActiveFeedInfoPanel
