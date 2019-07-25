import { connect } from 'react-redux'

import StatusMessage from '../components/StatusMessage'

const mapStateToProps = (state, ownProps) => {
  return {
    message: state.status.message,
    sidebarExpanded: state.ui.sidebarExpanded
  }
}

var CurrentStatusMessage = connect(
  mapStateToProps
)(StatusMessage)

export default CurrentStatusMessage
