import { connect } from 'react-redux'

import GtfsVersionSummary  from '../components/GtfsVersionSummary'

import {
  downloadGtfsFeed,
  publishGtfsFeed
} from '../actions/editor'

const mapStateToProps = (state, ownProps) => {
  return {
    editor: state.editor,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    gtfsPlusDataRequested: (version) => {
      dispatch(downloadGtfsFeed(version.id))
    },
    publishClicked: (version) => {
      dispatch(publishGtfsFeed(version))
    }
  }
}

const ActiveGtfsVersionSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsVersionSummary)

export default ActiveGtfsVersionSummary
