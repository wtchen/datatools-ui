import {connect} from 'react-redux'

import StatusModal from '../components/StatusModal'
import {clearStatusModal} from '../../manager/actions/status'
import {removeEditorLock} from '../../editor/actions/editor'

const mapStateToProps = (state, ownProps) => {
  const {modal} = state.status
  return {
    ...modal
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
