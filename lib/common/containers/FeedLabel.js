// @flow

import { connect } from 'react-redux'

import { deleteLabel } from '../../manager/actions/labels'
import FeedLabel from '../components/FeedLabel'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
  deleteLabel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedLabel)
