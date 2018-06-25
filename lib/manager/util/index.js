// @flow

import moment from 'moment'

import type {Feed, FeedVersion, Project, User} from '../../types'

export function findProjectByFeedSource (
  allProjects: ?Array<Project>,
  feedSourceId: string
): ?Project {
  return allProjects
    ? allProjects.find(p => {
      if (!p.feedSources) {
        return false
      }
      return p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1
    })
    : null
}

export function versionHasExpired (version: FeedVersion): boolean {
  return moment(version.validationResult.endDate).isBefore(moment())
}

export function versionHasNotBegun (version: FeedVersion): boolean {
  return moment(version.validationResult.startDate).isAfter(moment())
}

export function isEditingDisabled (
  user: User,
  feedSource: Feed,
  project: Project
): boolean {
  // If any of the args or null,
  return (
    !user ||
    !feedSource ||
    !project ||
    // or the user does not have permission, editing is disabled.
    !user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'edit-gtfs'
    )
  )
}
