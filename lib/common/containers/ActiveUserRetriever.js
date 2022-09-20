// @flow
import { useAuth0 } from '@auth0/auth0-react'
// $FlowFixMe useEffect not recognized by flow.
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import * as userActions from '../../manager/actions/user'
import { getUserInfoForThisClient } from '../util/user'
import type { AppState } from '../../types/reducers'

/**
 * Retrieves the active, authenticated user from auth0 and
 * updates the redux state accordingly.
 */
const ActiveUserRetriever = ({ accountTypes, logout, receiveTokenAndProfile }) => {
  const auth0 = useAuth0()
  const {
    error,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    user: profile
  } = auth0

  // Any time the login state reported by auth0 changes,
  // update the user info in the redux state.
  useEffect(async () => {
    if (isAuthenticated) {
      // Request a detailed response in order to get the user app permissions stored in Auth0.
      const tokenResponse = await getAccessTokenSilently({
        detailedResponse: true
      })
      // TRICKY: What we are passing to the backend is the id_token portion of the response.
      // Unlike the access_token portion, the id_token contains the app_metadata info for the user.
      receiveTokenAndProfile({ profile, token: tokenResponse.id_token })
    } else if (!isLoading) {
      if (error) {
        // If login fails for "technical" reasons (e.g. incorrect settings in env.yml or in Auth0 dashboard),
        // then show the error in a basic prompt.
        alert(error)
      }
      logout(auth0)
    }
  }, [isAuthenticated, isLoading, profile])

  useEffect(() => {
    if (isAuthenticated) {
      // Detect whether to show terms and conditions for the user account.
      if (profile.app_metadata) {
        const userInfoForThisClient = getUserInfoForThisClient(profile.app_metadata.datatools)
        if (userInfoForThisClient) {
          const accountType = accountTypes.find(acct => acct.type === userInfoForThisClient.account_type)
          const accountRequiresTerms = accountType && accountType.require_terms
          if (accountRequiresTerms) {
            // Redirect to license page if account is subject to terms.
            browserHistory.push('/license')
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, profile, accountTypes])

  // Component renders nothing.
  return null
}

const mapStateToProps = (state: AppState) => {
  const { appInfo } = state.status
  const { licensing } = (appInfo && appInfo.config.modules) || {}
  return {
    accountTypes: (licensing && licensing.enabled && licensing.account_types) || []
  }
}

const mapDispatchToProps = {
  logout: userActions.logout,
  receiveTokenAndProfile: userActions.receiveTokenAndProfile
}

export default connect(mapStateToProps, mapDispatchToProps)(ActiveUserRetriever)
