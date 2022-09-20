// @flow

import { withAuth0 } from '@auth0/auth0-react'
import { connect } from 'react-redux'
import qs from 'qs'

import { getAccountType, getAccountTypes } from '../../common/util/user'
import LicenseTerms from '../components/LicenseTerms'
import * as userActions from '../../manager/actions/user'
import type { AppState } from '../../types/reducers'

const mapStateToProps = (state: AppState) => {
  const { user } = state
  const accountType = getAccountType(user.profile, getAccountTypes(state))
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
