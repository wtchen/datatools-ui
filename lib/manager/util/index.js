// @flow
import type {Feed, FeedVersion, Project} from '../../types'
import type {ManagerUserState, ProjectsState} from '../../types/reducers'

export function findProjectByFeedSource (
  allProjects: ?Array<Project>,
  feedSourceId: ?string
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
  user: ManagerUserState,
  feedSource: Feed,
  project: ?Project
): boolean {
  // If any of the args or null,
  return (
    !user ||
    !feedSource ||
    !project ||
    // or the user does not have permission, editing is disabled.
    !user.permissions ||
    !user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'edit-gtfs'
    )
  )
}

/**
 * Helper function to get the index of various things from the project state.
 */
export function getIndexesFromFeed ({
  errorType,
  feedSourceId,
  feedVersionId,
  projectId,
  state
}: {
  errorType?: string,
  feedSourceId?: string,
  feedVersionId?: FeedVersion,
  projectId: string,
  state: ProjectsState
}): {
  errorIndex: number,
  projectIndex: number,
  sourceIndex: number,
  versionIndex: number
} {
  const projectIndex = state.all.findIndex(p => p.id === projectId)
  if (!feedSourceId || projectIndex < 0) {
    return { projectIndex, sourceIndex: -2, versionIndex: -2, errorIndex: -2 }
  }
  const project = state.all[projectIndex]
  if (!project.feedSources) {
    return { projectIndex, sourceIndex: -2, versionIndex: -2, errorIndex: -2 }
  }
  const sourceIndex = project.feedSources.findIndex(s => s.id === feedSourceId)
  if (!feedVersionId || sourceIndex < 0 || !project.feedSources) {
    return { projectIndex, sourceIndex, versionIndex: -2, errorIndex: -2 }
  }
  const feedSource = project.feedSources[sourceIndex]
  if (!feedSource.feedVersions) {
    return { projectIndex, sourceIndex, versionIndex: -2, errorIndex: -2 }
  }
  const versionIndex = feedSource.feedVersions.findIndex(v => v.id === feedVersionId)
  if (!errorType || !feedSource.feedVersions || versionIndex < 0) {
    return { projectIndex, sourceIndex, versionIndex, errorIndex: -2 }
  }
  const feedVersion = feedSource.feedVersions[versionIndex]
  const errorIndex = feedVersion.validationResult.error_counts.findIndex(
    e => e.type === errorType
  )
  return { errorIndex, projectIndex, sourceIndex, versionIndex }
}
