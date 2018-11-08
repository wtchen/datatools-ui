// @flow

import { connect } from 'react-redux'

import StatusMessage from '../components/StatusMessage'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: {}) => {
  return {
    message: state.status.message,
    sidebarExpanded: state.ui.sidebarExpanded
  }
}

var CurrentStatusMessage = connect(
  mapStateToProps
)(StatusMessage)

export default CurrentStatusMessage
