// @flow

import {connect} from 'react-redux'
import {push} from 'react-router-redux/lib/actions'

import Login from '../components/Login'
import {receiveTokenAndProfile} from '../../manager/actions/user'

import type {AppState} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: {onHide?: () => void}) => {
  const {redirectOnSuccess} = state.user
  return {
    // If redirect URL is null, we want to default to application home.
    redirectOnSuccess: redirectOnSuccess || window.location.path || '/home'
  }
}

const mapDispatchToProps = {
  push,
  receiveTokenAndProfile,
  // Default onHide action is to go back to root page
  onHide: () => push('/')
}

// this was done because there was an error I couldn't figure out in StatusModal
const connected: any = connect(mapStateToProps, mapDispatchToProps)(Login)
export default connected
