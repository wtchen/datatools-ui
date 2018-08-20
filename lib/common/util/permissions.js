// @flow

import type {AlertEntity, Feed, Project} from '../../types'
import type {UserState} from '../../manager/reducers/user'

export function getFeedsForPermission (
  project: Project,
  user: UserState,
  permission: string
): Array<Feed> {
  return project && project.feedSources
    ? project.feedSources.filter(
      feed =>
        user.permissions && user.permissions.hasFeedPermission(
          project.organizationId,
          project.id,
          feed.id,
          permission
        ) !== null
    )
    : []
}

// ensure list of feeds contains all agency IDs for set of entities
export function checkEntitiesForFeeds (
  entities: Array<AlertEntity>,
  feeds: Array<Feed>
): boolean {
  const publishableIds: Array<string> = feeds.map(f => f.id)
  const entityIds: Array<string> = entities
    ? entities.map(entity => entity.agency ? entity.agency.id : '')
    : []
  for (var i = 0; i < entityIds.length; i++) {
    if (publishableIds.indexOf(entityIds[i]) === -1) return false
  }
  return true
}
