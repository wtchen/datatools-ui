import { secureFetch } from '../../common/util/util'
import { getFeed } from '../../common/util/modules'
export const updatingGtfsFilter = (activeProject, user) => {
  return {
    type: 'UPDATE_GTFS_FILTER',
    activeProject,
    user
  }
}

export const updateLoadedFeeds = (loadedFeeds) => {
  return {
    type: 'UPDATE_LOADED_FEEDS',
    loadedFeeds
  }
}

export function updateGtfsFilter (activeProject, user) {
  return function (dispatch, getState) {
    dispatch(updatingGtfsFilter(activeProject, user))
    return secureFetch('/api/manager/feeds', getState())
      .then(response => response.json())
      .then((feedIds) => {
        let feeds = feedIds.map(id => getFeed(getState().projects.active.feedSources, id)).filter(n => n)
        dispatch(updateLoadedFeeds(feeds))
      })
  }
}

export const setPermissionFilter = (permission) => {
  return {
    type: 'SET_GTFS_PERMISSION_FILTER',
    permission
  }
}

export const addActiveFeed = (feed) => {
  return {
    type: 'ADD_ACTIVE_FEED',
    feed
  }
}

export const removeActiveFeed = (feed) => {
  return {
    type: 'REMOVE_ACTIVE_FEED',
    feed
  }
}

export const addAllActiveFeeds = () => {
  return {
    type: 'ADD_ALL_ACTIVE_FEEDS'
  }
}

export const removeAllActiveFeeds = () => {
  return {
    type: 'REMOVE_ALL_ACTIVE_FEEDS'
  }
}
