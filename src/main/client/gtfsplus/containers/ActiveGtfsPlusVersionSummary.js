import { connect } from 'react-redux'

import GtfsPlusVersionSummary  from '../components/GtfsPlusVersionSummary'

import {
  downloadGtfsPlusFeed,
  publishGtfsPlusFeed
} from '../actions/gtfsplus'

const mapStateToProps = (state, ownProps) => {
  return {
    gtfsplus: state.gtfsplus
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    gtfsPlusDataRequested: (version) => {
      dispatch(downloadGtfsPlusFeed(version.id))
    },
    publishClicked: (version) => {
      dispatch(publishGtfsPlusFeed(version))
    }
  }
}

const ActiveGtfsPlusVersionSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(GtfsPlusVersionSummary)

export default ActiveGtfsPlusVersionSummary
