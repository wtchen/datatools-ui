import { connect } from 'react-redux'

import StatusModal from '../components/StatusModal'
import { clearStatusModal } from '../../manager/actions/status'

const mapStateToProps = (state, ownProps) => {
  return {
    title: state.status.modal ? state.status.modal.title : null,
    body: state.status.modal ? state.status.modal.body : null
  }
}
const mapDispatchToProps = {
  clearStatusModal
}
var CurrentStatusModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusModal)

export default CurrentStatusModal
