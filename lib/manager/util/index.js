// @flow

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

export function getChartMax (maxValue: number): number {
  return maxValue < 100 ? maxValue : Math.ceil(maxValue / 100) * 100
}

export function getChartPeriod (maxValue: number): number {
  return maxValue > 20000
    ? 5000
    : maxValue > 1000
      ? 1000
      : maxValue > 300
        ? 100
        : maxValue > 100
          ? 30
          : maxValue > 20
            ? 10
            : 3
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
