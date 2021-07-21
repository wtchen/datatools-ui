// @flow

import { connect } from 'react-redux'

import { createLabel, updateLabel } from '../../manager/actions/labels'
import LabelEditor from '../components/LabelEditor'

const mapStateToProps = (state, ownProps) => {
  return {
    newLabel: state.newLabel,
    user: state.user
  }
}

const mapDispatchToProps = {
  createLabel, updateLabel
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LabelEditor)
