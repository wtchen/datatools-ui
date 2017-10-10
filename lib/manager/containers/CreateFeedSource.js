// @flow

import { connect } from 'react-redux'

import { createFeedInfo } from '../../editor/actions/feedInfo'
import CreateFeedSource from '../components/CreateFeedSource'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    createFeedInfo
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateFeedSource)
