import { connect } from 'react-redux'
import { fetchSnapshots } from '../actions/editor.js'

import EditorFeedSourcePanel from '../components/EditorFeedSourcePanel'

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    getSnapshots: (feedSource) => {
      dispatch(fetchSnapshots(feedSource))
    }
  }
}

const ActiveEditorFeedSourcePanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorFeedSourcePanel)

export default ActiveEditorFeedSourcePanel
