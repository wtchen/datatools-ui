// @flow

import moment from 'moment'

import type {
  Feed,
  FeedVersion,
  Project,
  SummarizedFeedVersion
} from '../../types'
import type {FeedSourceTableComparisonColumns} from '../../types/reducers'

export function getTableFatalExceptions (version: FeedVersion): Array<any> {
  const tableFatalExceptions = []
  for (const key in version.feedLoadResult) {
    if (version.feedLoadResult.hasOwnProperty(key)) {
      const loadItem = version.feedLoadResult[key]
      if (loadItem && loadItem.fatalException) {
        tableFatalExceptions.push({
          tableName: key,
          ...loadItem
        })
        break
      }
    }
  }
  return tableFatalExceptions
}

/**
 * Get string containing comma-separated feed source names from versions list.
 */
export function getFeedNames (
  versions: Array<SummarizedFeedVersion>
): string {
  return versions.map(version => version.feedSource.name).join(', ')
}

export function versionHasExpired (
  version: SummarizedFeedVersion
): boolean {
  return moment(version.validationResult.endDate).isBefore(moment())
}

export function versionHasNotBegun (
  version: SummarizedFeedVersion
): boolean {
  return moment(version.validationResult.startDate).isAfter(moment())
}

/**
 * Get the appropriate comparison feed version or summarized feed version given
 * a project, the feed source within the project and a comparison column.
 */
export function getVersionByFilterStrategy (
  project: Project,
  feedSource: Feed,
  comparisonColumn: FeedSourceTableComparisonColumns
): ?(FeedVersion | SummarizedFeedVersion) {
  let comparisonVersion
  if (comparisonColumn === 'DEPLOYED') {
    const comparisonDeployment = project.deployments
      ? (
        (
          project.pinnedDeploymentId &&
            project.deployments.find(
              deployment => deployment.id === project.pinnedDeploymentId
            )
        ) || (
          project.deployments && project.deployments.length > 0
            ? project.deployments[0]
            : null
        )
      )
      : null

    if (comparisonDeployment) {
      comparisonVersion = comparisonDeployment.feedVersions.find(
        version => version.feedSource.id === feedSource.id
      )
    }
  } else if (comparisonColumn === 'PUBLISHED') {
    if (feedSource.feedVersions) {
      comparisonVersion = feedSource.feedVersions.find(
        version => version.feedSource.id === feedSource.id
      )
    }
  }
  return comparisonVersion
}
