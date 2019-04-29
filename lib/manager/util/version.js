// @flow

import moment from 'moment'

import type {
  Feed,
  FeedVersion,
  Project,
  SummarizedFeedVersion,
  ValidationSummary
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

// Error types that should prevent publishing a feed version to MTC. These types
// must correspond to those found at:
// https://github.com/conveyal/gtfs-lib/blob/dev/src/main/java/com/conveyal/gtfs/error/NewGTFSErrorType.java
export const BLOCKING_ERROR_TYPES = [
  'ILLEGAL_FIELD_VALUE',
  'TABLE_IN_SUBDIRECTORY',
  'WRONG_NUMBER_OF_FIELDS',
  'MISSING_COLUMN',
  'TABLE_MISSING_COLUMN_HEADERS',
  'REFERENTIAL_INTEGRITY'
]

/**
 * Get the appropriate comparison feed version or summarized feed version
 * summary given a project, the feed source within the project and a comparison
 * column.
 */
export function getVersionValidationSummaryByFilterStrategy (
  project: Project,
  feedSource: Feed,
  comparisonColumn: FeedSourceTableComparisonColumns
): ?ValidationSummary {
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
      const comparisonVersion = comparisonDeployment.feedVersions.find(
        version => version.feedSource.id === feedSource.id
      )
      return comparisonVersion && comparisonVersion.validationResult
    }
  } else if (comparisonColumn === 'PUBLISHED') {
    return feedSource.publishedValidationSummary
  }
}
