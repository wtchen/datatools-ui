// @flow

import { Auth0ContextInterface, withAuth0 } from '@auth0/auth0-react'
import omit from 'lodash/omit'
import * as React from 'react'
import {connect} from 'react-redux'
import { browserHistory } from 'react-router'

import * as statusActions from '../../manager/actions/status'
import * as userActions from '../../manager/actions/user'
import type {AppState, ManagerUserState} from '../../types/reducers'

type AuthWrapperProps = {
  auth0: Auth0ContextInterface,
  checkLogin: typeof userActions.checkLogin,
  fetchAppInfo: typeof statusActions.fetchAppInfo,
  login: typeof userActions.login,
  user: ManagerUserState
}

export default function wrapComponentInAuthStrategy (
  ComponentToWrap: React.Component<*>,
  requireAuth?: boolean,
  requireAdmin?: boolean
): React.Component<AuthWrapperProps> {
  class AuthStrategyWrapper extends React.Component<AuthWrapperProps> {
    componentWillMount () {
      const {checkLogin, fetchAppInfo, user} = this.props
      const userIsLoggedIn: boolean = !!user.token
      // Fetch app info before component mounts in order to ensure that checks
      // for enabled modules result use the correct config data.
      fetchAppInfo()
        .then(() => {
          checkLogin(userIsLoggedIn)
          if (userIsLoggedIn) {
            this._checkIfAdmin()
          }
        })
    }

    componentWillReceiveProps (nextProps) {
      const {login, user} = nextProps
      // First check to see if admin privileges are needed.
      this._checkIfAdmin()
      if (
        // Auth required and user is not logged in.
        (requireAuth && !user.isCheckingLogin && !user.token) // ||
        // Token existed previously, but was removed in next props.
        // FIXME: Is this second condition needed here?
        // (this.props.user.token && !user.token)
      ) {
        // If auth is required and the user is not logged in, trigger a log in,
        // which will change the route to '/login' and show the auth0 lock.
        const redirectUrl: string = window.location.pathname
        login(this.props.auth0, redirectUrl)
      }
    }

    _userHasAdminViewPrivileges () {
      const {user} = this.props
      if (!user || !user.permissions) return false
      if (user.permissions.isApplicationAdmin()) return true
      if (user.permissions && user.permissions.canAdministerAnOrganization()) return true
    }

    _checkIfAdmin () {
      if (requireAdmin &&
        !this.props.user.isCheckingLogin &&
        !this._userHasAdminViewPrivileges()
      ) {
        // If an authenticated, non-admin user attempts to visit an admin page,
        // send them back to the root page.
        browserHistory.push('/')
      }
    }

    render () {
      const {user} = this.props
      if (requireAuth && !user.token) {
        // If user is not authenticated and the page requires it, return the
        // unauthorized user page. We should only get to this point if there is
        // a slight delay in the component lifecycle.
        // When the component receives props, a check for auth will trigger the
        // login with lock.
        return null
      } else {
        // Otherwise, check for admin access and finally just return the page.
        if (requireAdmin && !this._userHasAdminViewPrivileges()) {
          // If admin privileges are required, but the user is not authorized.
          return (
            <div>
              <p>You have attempted to view a restricted page without proper credentials</p>
            </div>
          )
        } else {
          // User is authenticated to view page or it is a public route.
          return (
            // Below Flow issue is related to a mismatch between the
            // React.Component return type and React.Element. This has something
            // to do with the possibility for an iterable to exist here.
            // $FlowFixMe
            <ComponentToWrap
              // Pass props to wrapped component except for auth-specific props
              {...omit(this.props, ['checkLogin', 'children', 'user'])} />
          )
        }
      }
    }
  }
  const {checkLogin, login} = userActions
  const {fetchAppInfo} = statusActions
  const connectedComponent = connect(
    // state to props
    (state: AppState) => ({user: state.user}),
    // dispatch to props
    {checkLogin, fetchAppInfo, login}
  )(AuthStrategyWrapper)

  return withAuth0(connectedComponent)
}
