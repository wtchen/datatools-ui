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
export const getSettingsForThisClient = (allClientSettings?: ?Array<DatatoolsSettings>): ?DatatoolsSettings =>
  allClientSettings && allClientSettings.find(isSettingForThisClient)

/**
 * Variant of above method that takes in a UserProfile object.
 */
export const getSettingsFromProfile = (profile: ?UserProfile): ?DatatoolsSettings =>
  profile &&
  profile.app_metadata &&
  getSettingsForThisClient(profile.app_metadata.datatools)

export const getUserMetadataProperty = (
  profile: ?Profile,
  propertyString: string
) => {
  const datatools = objectPath.get(profile, 'user_metadata.datatools')
  const application = getSettingsForThisClient(datatools)
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
 * Gets the default account type, if any.
 */
export function getDefaultAccountType (accountTypes: Array<AccountType>): ?AccountType {
  // Prefer checking for boolean value true instead of anything that resolves to not-false.
  return accountTypes.find(acct => acct.default === true)
}

/**
 * Gets various information to display the account type of the given user.
 */
export function getAccountInfo (user: UserProfile, accountTypes: Array<AccountType>): {
  accountType: ?string,
  accountTypeObject: ?AccountType,
  displayName: ?string,
  isDefault: boolean,
  isUnknown: boolean
} {
  const defaultAccountType = getDefaultAccountType(accountTypes)

  const userSettings = getSettingsFromProfile(user)
  const accountType = userSettings && userSettings.account_type
  const accountTypeObject = accountType ? accountTypes.find(acct => acct.type === accountType) : null
  const isUnknown = !!(accountType && !accountTypeObject)
  const displayName = accountTypeObject
    ? accountTypeObject.name
    : !isUnknown && defaultAccountType
      ? defaultAccountType.name
      : null
  return {
    accountType,
    accountTypeObject,
    displayName,
    isDefault: !accountTypeObject && !!defaultAccountType,
    isUnknown
  }
}
