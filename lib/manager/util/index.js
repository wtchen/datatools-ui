// @flow

import moment from 'moment'
import {get} from 'object-path'

import {getVersionValidationStrategyByFilterStrategy} from './version'

import type {Feed, FeedVersion, Project, ValidationSummary} from '../../types'
import type {
  FeedSourceTableFilterCountStrategies,
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

/**
 * A lookup of functions to verify if a version validation summary meets the
 * requirments of a particular status.
 */
export const versionStatusFilters: {
  [string]: (
    ?ValidationSummary
  ) => boolean
} = {
  'all': () => true,
  'active': (data) => !!data &&
    moment(data.startDate).isSameOrBefore(moment()) &&
    moment(data.endDate).isSameOrAfter(moment()),
  'expiring': (data) => !!data &&
    moment(data.endDate).subtract(20, 'days').isSameOrBefore(moment()) &&
    moment(data.endDate).subtract(5, 'days').isAfter(moment()),
  'expired': (data) => !!data &&
    moment(data.endDate).isSameOrBefore(moment()),
  'future': (data) => !!data &&
    moment(data.startDate).isAfter(moment())
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

/**
 * A filter function to detemine if a feed meets the criteria of a specified
 * filter option based on the current filter count strategy.
 */
export function filterFeedByFilterCountStrategy (
  feed: Feed,
  filterCountStrategy: FeedSourceTableFilterCountStrategies,
  filterOption: string,
  project: Project
): boolean {
  let data
  switch (filterCountStrategy) {
    case 'LATEST':
      data = feed.latestValidation
      break
    case 'DEPLOYED':
    case 'PUBLISHED':
      const validationSummary = getVersionValidationStrategyByFilterStrategy(
        project,
        feed,
        filterCountStrategy
      )
      if (validationSummary) {
        data = validationSummary
      } else {
        return false
      }
      break
    default:
      return false
  }
  return versionStatusFilters[filterOption](data)
}

/**
 * Count the number of feeds that match each type of filter options based on the
 * current filter count strategy.
 */
export function getFeedFilterCounts (
  project: Project,
  filterCountStrategy: FeedSourceTableFilterCountStrategies
): {
  [string]: number
} {
  const feeds = (project && project.feedSources) || []
  const counts = Object.keys(versionStatusFilters).reduce((obj, filterOption) => {
    obj[filterOption] = feeds.filter(
      feed => filterFeedByFilterCountStrategy(
        feed,
        filterCountStrategy,
        filterOption,
        project
      )
    ).length
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
  const {error_counts: errorCounts} = feedSource.feedVersions[versionIndex].validationResult
  const errorIndex = errorCounts
    ? errorCounts.findIndex(e => e.type === errorType)
    : -2
  return { errorIndex, projectIndex, sourceIndex, versionIndex }
}

/**
 * Check if a project exists and has at least one deployment
 */
export function projectHasAtLeastOneDeployment (project: ?Project): boolean {
  return !!project &&
    !!project.deployments &&
    project.deployments.length > 0
}

/**
 * Check if a project exists and has at least one feed that has a published
 * feed version
 */
export function projectHasAtLeastOneFeedWithAPublishedVersion (project: ?Project): boolean {
  return !!project &&
    !!project.feedSources &&
    project.feedSources.some(feedSource => feedSource.publishedVersionId)
}

export function validationState (val: ?boolean): ?string {
  return val ? undefined : 'error'
}
