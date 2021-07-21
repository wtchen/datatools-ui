// @flow

import { connect } from 'react-redux'

import { updateFeedSource } from '../actions/feeds'
import LabelAssigner from '../components/LabelAssigner'

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = {
  updateFeedSource
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelAssigner)
