// @flow

import moment from 'moment'
import {get} from 'object-path'

import type {Feed, FeedVersion, Project} from '../../types'
import type {
  FeedSourceTableSortStrategiesWithOrders,
  ManagerUserState,
  ProjectsState
} from '../../types/reducers'

/**
 * Sort function that compares a field that might be datetimes. If ascending is
 * set to false, the entities will be sorting in descending order. Empty entries
 * are always sent to the bottom.
 */
function momentSort (field: string, ascending: boolean = true) {
  return (a, b) => {
    const aVal = get(a, field)
    const bVal = get(b, field)
    if (!aVal && !bVal) return 0
    if (!bVal) return -1
    if (!aVal) return 1
    const aMoment = moment(aVal)
    const bMoment = moment(bVal)
    if (!aMoment.isValid() && !bMoment.isValid()) return 0
    if (!bMoment.isValid()) return -1
    if (!aMoment.isValid()) return 1
    return ascending
      ? aMoment.unix() - bMoment.unix()
      : bMoment.unix() - aMoment.unix()
  }
}

/**
 * Sort by a numeric field, but always have empty values be at the bottom.
 */
function numericSort (field: string, ascending: boolean = true) {
  return (a, b) => {
    const aVal = get(a, field)
    const bVal = get(b, field)
    if (!aVal && !bVal) return 0
    if (!bVal) return -1
    if (!aVal) return 1
    return ascending ? aVal - bVal : bVal - aVal
  }
}

/**
 * An enumration of feed sort options and their respective sorting strategy
 */
export const feedSortOptions: {
  [FeedSourceTableSortStrategiesWithOrders]: (Feed, Feed) => number
} = {
  'alphabetically-asc': (a, b) => a.name.localeCompare(b.name),
  'alphabetically-desc': (a, b) => b.name.localeCompare(a.name),
  'endDate-asc': momentSort('latestValidation.endDate'),
  'endDate-desc': momentSort('latestValidation.endDate', false),
  'startDate-asc': momentSort('latestValidation.startDate'),
  'startDate-desc': momentSort('latestValidation.startDate', false),
  'lastUpdated-asc': momentSort('lastUpdated'),
  'lastUpdated-desc': momentSort('lastUpdated', false),
  'numErrors-asc': numericSort('latestValidation.errorCount'),
  'numErrors-desc': numericSort('latestValidation.errorCount', false)
}

export const feedFilterOptions: {
  [string]: (Feed) => boolean
} = {
  'all': () => true,
  'active': (feed) => !!feed.latestValidation &&
    moment(feed.latestValidation.startDate).isSameOrBefore(moment()) &&
    moment(feed.latestValidation.endDate).isSameOrAfter(moment()),
  'expiring-within-20-days': (feed) => !!feed.latestValidation &&
    moment(feed.latestValidation.endDate).subtract(20, 'days').isSameOrBefore(moment()) &&
    moment(feed.latestValidation.endDate).subtract(5, 'days').isAfter(moment()),
  'expired': (feed) => !!feed.latestValidation &&
    moment(feed.latestValidation.endDate).isSameOrBefore(moment()),
  'future': (feed) => !!feed.latestValidation &&
    moment(feed.latestValidation.startDate).isAfter(moment())
}

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

export function getFeedFilterCountsForProject (project: Project): {
  [string]: number
} {
  const feeds = (project && project.feedSources) || []
  const counts = Object.keys(feedFilterOptions).reduce((obj, filterOption) => {
    obj[filterOption] = feeds.filter(feedFilterOptions[filterOption]).length
    return obj
  }, {})

  return counts
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

export function validationState (val: ?boolean): ?string {
  return val ? undefined : 'error'
}
