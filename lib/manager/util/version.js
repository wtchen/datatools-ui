// @flow

import moment from 'moment'

import type {FeedVersion} from '../../types'

export function getTableFatalExceptions (version: FeedVersion): Array<string> {
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
export function getFeedNames (versions: Array<FeedVersion>): string {
  return versions.map(version => version.feedSource.name).join(', ')
}

export function versionHasExpired (version: FeedVersion): boolean {
  return moment(version.validationResult.endDate).isBefore(moment())
}

export function versionHasNotBegun (version: FeedVersion): boolean {
  return moment(version.validationResult.startDate).isAfter(moment())
}
