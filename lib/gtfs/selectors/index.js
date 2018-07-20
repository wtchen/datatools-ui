// @flow

import { createSelector } from 'reselect'

import {getFeedsForPermission} from '../../common/util/permissions'
import {getActiveProject} from '../../manager/selectors'

import type {AppState} from '../../types'

const getPermissionFilter = (state) => state.gtfs.filter.permissionFilter

export const getAllFeeds: AppState => any = createSelector(
  [ state => state.user, getPermissionFilter, getActiveProject ],
  (user, filter, project) => {
    return getFeedsForPermission(project, user, filter)
  }
)

export const getPublishedFeeds = createSelector(
  [ getActiveProject ],
  (activeProject) => {
    return activeProject && activeProject.feedSources
      ? activeProject.feedSources.filter(feedSource => feedSource.publishedVersionId)
      : []
  }
)

export const getActiveFeeds: AppState => any = createSelector(
  [ getAllFeeds, state => state.gtfs.filter.activeFeeds ],
  (all, active) => {
    return all.filter((feed, index) => active && active[feed.id])
  }
)

export const getActiveAndLoadedFeeds: AppState => any = createSelector(
  [ getActiveFeeds, getPublishedFeeds ],
  (active, published) => {
    return active.filter(f => f && published.findIndex(feed => feed.id === f.id) !== -1)
  }
)
