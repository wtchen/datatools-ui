// @flow

// $FlowFixMe useEffect not recognized by flow.
import { useEffect } from 'react'
import { browserHistory } from 'react-router'

import type { Props as ContainerProps } from '../containers/Login'

type Props = ContainerProps & {
  loggedIn: boolean
}

export default function Login ({ auth0, loggedIn, query, redirectOnSuccess }: Props) {
  const { to: toParam } = query
  useEffect(() => {
    if (!toParam && !loggedIn && redirectOnSuccess) {
      // Show the login page if the user state is not logged in.
      auth0.loginWithRedirect({
        redirectUri: `${window.location.origin}/login?to=${redirectOnSuccess}`
      })
    }
    if (toParam && loggedIn) {
      browserHistory.push(toParam)
    }
  }, [loggedIn, toParam, redirectOnSuccess])

  // Component renders nothing.
  return null
}
