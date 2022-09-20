// @flow

import objectPath from 'object-path'

import type { AccountType, DatatoolsSettings, Profile, UserProfile } from '../../types'
import type { AppState } from '../../types/reducers'

/**
 * Predicate that determines whether a settings object correspond to the configured Auth0 client.
 */
export const isSettingForThisClient = (settings: DatatoolsSettings) => {
  const clientId = process.env.AUTH0_CLIENT_ID
  if (!clientId) throw new Error('Auth0 client ID must be set in config')

  return settings.client_id === clientId
}

/**
 * Obtains the entry for the user's app_metadata.datatools (in Auth0) that corresponds to the configured client,
 * or null if no such entry exists.
 */
export const getUserInfoForThisClient = (
  allUserInfo?: ?Array<DatatoolsSettings>
): ?DatatoolsSettings => allUserInfo && allUserInfo.find(isSettingForThisClient)

export const getUserMetadataProperty = (
  profile: ?Profile,
  propertyString: string
) => {
  const datatools = objectPath.get(profile, 'user_metadata.datatools')
  const application = getUserInfoForThisClient(datatools)
  return objectPath.get(application, propertyString)
}

/**
 * Gets the configured account types
 */
export function getAccountTypes (state: AppState): Array<AccountType> {
  const { appInfo } = state.status
  const { licensing } = (appInfo && appInfo.config.modules) || {}
  return (licensing && licensing.enabled && licensing.account_types) || []
}

/**
 * Gets the account type (or null) for the given profile and the configured account types.
 */
export function getAccountType (profile: ?UserProfile, accountTypes: Array<AccountType>): ?AccountType {
  const userInfoForThisClient = getUserInfoForThisClient(profile && profile.app_metadata.datatools)
  if (userInfoForThisClient) {
    return accountTypes.find(acct => acct.type === userInfoForThisClient.account_type)
  }
  return null
}
