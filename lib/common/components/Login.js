// @flow

// $FlowFixMe useEffect not recognized by flow.
import { useEffect } from 'react'

import type { Props as ContainerProps } from '../containers/Login'

type Props = ContainerProps & {
  loggedIn: boolean
}

export default function Login ({ auth0, loggedIn, redirectOnSuccess }: Props) {
  useEffect(() => {
    if (!loggedIn && redirectOnSuccess) {
      // Show the login page if the user state is not logged in.
      auth0.loginWithRedirect({
        appState: {
          returnTo: redirectOnSuccess
        }
      })
    }
  }, [loggedIn, redirectOnSuccess])

  // Component renders nothing.
  return null
}
