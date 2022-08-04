// @flow

import { Auth0ContextInterface, withAuth0 } from '@auth0/auth0-react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux/lib/actions'

import Login from '../components/Login'
import type { AppState, RouterProps } from '../../types/reducers'

export type Props = $Shape<RouterProps> & {
  auth0: Auth0ContextInterface,
  onHide?: () => void,
  query: any,
  redirectOnSuccess?: string
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const { redirectOnSuccess } = state.user
  const { locationBeforeTransitions } = state.routing
  return {
    loggedIn: ownProps.auth0.isAuthenticated,
    query: (locationBeforeTransitions && locationBeforeTransitions.query) || {},
    // If redirect URL is null, we want to default to application home.
    redirectOnSuccess: redirectOnSuccess || window.location.path || '/home'
  }
}

const mapDispatchToProps = {
  push
}

export default withAuth0(connect(mapStateToProps, mapDispatchToProps)(Login))
