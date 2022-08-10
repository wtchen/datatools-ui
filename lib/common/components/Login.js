// @flow

import { useAuth0 } from '@auth0/auth0-react'
// $FlowFixMe useEffect not recognized by flow.
import { useEffect } from 'react'
import { browserHistory } from 'react-router'

type Props = {
  redirectOnSuccess?: string
}

export default function Login ({
  redirectOnSuccess = window.location.path || '/home'
}: Props) {
  const auth0 = useAuth0()
  const { isAuthenticated, isLoading } = auth0
  useEffect(() => {
    if (!isLoading && redirectOnSuccess) {
      if (!isAuthenticated) {
        // Show the login page if the user state is not logged in.
        auth0.loginWithRedirect({
          appState: {
            returnTo: redirectOnSuccess
          }
        })
      } else {
        // Otherwise just go to the target url.
        browserHistory.push(redirectOnSuccess)
      }
    }
  }, [isAuthenticated, isLoading, redirectOnSuccess])

  // Component renders nothing.
  return null
}
