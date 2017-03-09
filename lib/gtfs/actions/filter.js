import { secureFetch } from '../../common/util/util'
import { getFeed } from '../../common/util/modules'
export const updatingGtfsFilter = (activeProject, user) => {
  return {
    type: 'UPDATE_GTFS_FILTER',
    activeProject,
    user
  }
}

export function updateLoadedFeeds (loadedFeeds) {
  return {
    type: 'UPDATE_LOADED_FEEDS',
    loadedFeeds
  }
}

export function updateMapState (props) {
  return {
    type: 'UPDATE_GTFS_MAP_STATE',
    props
  }
}

export function updateGtfsFilter (activeProject, user) {
  return function (dispatch, getState) {
    dispatch(updatingGtfsFilter(activeProject, user))
    return secureFetch('/api/manager/feeds', getState())
      .then(response => response.json())
      .then((feedIds) => {
        const activeFeeds = getState().projects.active.feedSources
        // if (!activeFeeds) {
        //   return dispatch(fetchProjectFeeds(getState().projects.active.id))
        //   .then((projectFeeds) => {
        //     console.log(projectFeeds)
        //     let feeds = feedIds.map(id => getFeed(projectFeeds, id)).filter(n => n)
        //     console.log(feeds)
        //     dispatch(updateLoadedFeeds(feeds))
        //   })
        // }
        // else {
        const feeds = feedIds.map(id => getFeed(activeFeeds, id)).filter(n => n)
        dispatch(updateLoadedFeeds(feeds))
        // }
      })
  }
}

export function updatePermissionFilter (permission) {
  return {
    type: 'UPDATE_GTFS_PERMISSION_FILTER',
    permission
  }
}

export const updateDateTimeFilter = (props) => {
  return {
    type: 'UPDATE_GTFS_DATETIME_FILTER',
    props
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
