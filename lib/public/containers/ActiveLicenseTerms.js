// @flow

import { withAuth0 } from '@auth0/auth0-react'
import { connect } from 'react-redux'
import qs from 'qs'

import { getAccountTypes, getUserInfoForThisClient } from '../../common/util/user'
import LicenseTerms from '../components/LicenseTerms'
import * as userActions from '../../manager/actions/user'
import type { AppState } from '../../types/reducers'

const mapStateToProps = (state: AppState) => {
  const { user } = state
  const userInfoForThisClient = getUserInfoForThisClient(user.profile && user.profile.app_metadata.datatools)
  const accountType = userInfoForThisClient &&
    getAccountTypes(state).find(acct => acct.type === userInfoForThisClient.account_type)
  const search = window.location.search
  return {
    // Exclude the `?` at the beginning of the search term if it exists.
    // $FlowFixMe flow is missing definitions for qs.parse.
    returnTo: search.length ? qs.parse(search.substring(1)).returnTo : null,
    termsUrl: accountType && accountType.terms_url,
    user
  }
}

const mapDispatchToProps = {
  acceptAccountTerms: userActions.acceptAccountTerms,
  logout: userActions.logout
}

export default withAuth0(connect(
  mapStateToProps,
  mapDispatchToProps
)(LicenseTerms))
