// @flow

import objectPath from 'object-path'

import type { DatatoolsSettings, Profile } from '../../types'

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
