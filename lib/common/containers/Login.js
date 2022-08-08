// @flow

import { Auth0ContextInterface, withAuth0 } from '@auth0/auth0-react'
import { connect } from 'react-redux'

import Login from '../components/Login'
import type { AppState, RouterProps } from '../../types/reducers'

export type Props = $Shape<RouterProps> & {
  auth0: Auth0ContextInterface,
  redirectOnSuccess?: string
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const { redirectOnSuccess } = state.user
  return {
    loggedIn: ownProps.auth0.isAuthenticated,
    // If redirect URL is null, we want to default to application home.
    redirectOnSuccess: redirectOnSuccess || window.location.path || '/home'
  }
}

export default withAuth0(connect(mapStateToProps)(Login))
