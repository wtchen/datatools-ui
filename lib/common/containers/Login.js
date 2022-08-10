// @flow

import { connect } from 'react-redux'

import Login from '../components/Login'
import type { AppState } from '../../types/reducers'

export type Props = {
  redirectOnSuccess?: string
}

const mapStateToProps = (state: AppState) => {
  const { redirectOnSuccess } = state.user
  return {
    // If redirect URL is null, we want to default to application home.
    redirectOnSuccess: redirectOnSuccess || window.location.path || '/home'
  }
}

export default connect(mapStateToProps)(Login)
