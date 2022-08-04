// TODO: Add flow

import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import * as userActions from '../../manager/actions/user'

/**
 * Retrieves the active, authenticated user from auth0 and
 * updates the redux state accordingly.
 */
const ActiveUserRetriever = ({ receiveTokenAndProfile }) => {
  const auth0 = useAuth0()
  const { isAuthenticated, user: profile } = auth0

  // Any time the login state reported by auth0 changes,
  // update the user info in the redux state.
  useEffect(async () => {
    if (isAuthenticated) {
      const token = await auth0.getAccessTokenSilently()
      receiveTokenAndProfile({ profile, token })
    } else {
      receiveTokenAndProfile()
    }
  }, [auth0, isAuthenticated, profile])

  // Component renders nothing.
  return null
}

const mapDispatchToProps = {
  receiveTokenAndProfile: userActions.receiveTokenAndProfile
}

export default connect(null, mapDispatchToProps)(ActiveUserRetriever)
