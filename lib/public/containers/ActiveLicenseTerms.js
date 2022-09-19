// @flow

import { connect } from 'react-redux'
import { withAuth0 } from '@auth0/auth0-react'

import LicenseTerms from '../components/LicenseTerms'
import * as userActions from '../../manager/actions/user'
import type { AppState } from '../../types/reducers'

const mapStateToProps = (state: AppState) => {
  const { status, user } = state
  const { appInfo } = status

  // TODO: refactor multiple uses
  const userInfoForThisClient = user.profile && user.profile.app_metadata.datatools.find(
    dt => dt.client_id === process.env.AUTH0_CLIENT_ID
  )

  // TODO: refactor multiple uses
  const { licensing } = (appInfo && appInfo.config.modules) || {}
  const accountTypes = (licensing && licensing.enabled && licensing.account_types) || []
  const accountType = userInfoForThisClient && accountTypes.find(acct => acct.type === userInfoForThisClient.account_type)

  return {
    termsUrl: accountType && accountType.terms_url
  }
}

const mapDispatchToProps = {
  logout: userActions.logout
}

export default withAuth0(connect(
  mapStateToProps,
  mapDispatchToProps
)(LicenseTerms))
