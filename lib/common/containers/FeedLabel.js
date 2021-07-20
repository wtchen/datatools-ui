// @flow

import { connect } from 'react-redux'

import { deleteLabel } from '../../manager/actions/labels'
import FeedLabel from '../components/FeedLabel'

const mapStateToProps = (state, ownProps) => {
  return {
    label: state.label
  }
}

const mapDispatchToProps = {
  deleteLabel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedLabel)
