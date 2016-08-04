import objectPath from 'object-path'
import { getConfigProperty } from './config'

export const getUserMetadataProperty = (profile, propertyString) => {
  const CLIENT_ID = getConfigProperty('auth0.client_id')
  const datatools = objectPath.get(profile, 'user_metadata.datatools')
  const application = datatools && datatools.find(d => d.client_id === CLIENT_ID)
  return objectPath.get(application, propertyString)
}
