// @flow

import {connect} from 'react-redux'

import StatusModal from '../components/StatusModal'
import {clearStatusModal} from '../../manager/actions/status'
import {removeEditorLock} from '../../editor/actions/editor'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: {}) => {
  return {
    ...state.status.modal
  }
}
const mapDispatchToProps = {
  clearStatusModal,
  removeEditorLock
}

var CurrentStatusModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusModal)

export default CurrentStatusModal
