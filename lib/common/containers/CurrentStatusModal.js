import {connect} from 'react-redux'

import StatusModal from '../components/StatusModal'
import {clearStatusModal} from '../../manager/actions/status'
import {login} from '../../manager/actions/user'
import {removeEditorLock} from '../../editor/actions/editor'

const mapStateToProps = (state, ownProps) => {
  const {modal} = state.status
  return {
    ...modal
  }
}
const mapDispatchToProps = {
  clearStatusModal,
  login,
  removeEditorLock
}
var CurrentStatusModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusModal)

export default CurrentStatusModal
