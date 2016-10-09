import update from 'react-addons-update'
import moment from 'moment'

const gtfsFilter = (state = {
  allFeeds: [],
  activeFeeds: [],
  loadedFeeds: [],
  permissionFilter: 'view-feed',
  dateTimeFilter: {
    date: moment().format('YYYY-MM-DD'),
    from: 0,
    to: 86399
  }
}, action) => {
  // console.log(action)
  let activeFeeds, dateTimeFilter
  switch (action.type) {
    case 'UPDATE_GTFS_PERMISSION_FILTER':
      return update(state, {permissionFilter: {$set: action.permission}})
    case 'UPDATE_GTFS_DATETIME_FILTER':
      dateTimeFilter = {...state.dateTimeFilter}
      for (let key in action.props) {
        dateTimeFilter[key] = action.props[key]
      }
      return update(state, {
        dateTimeFilter: {$set: dateTimeFilter}
      })
    case 'UPDATE_GTFS_FILTER':
      let userFeeds = []
      if (action.user.permissions.isProjectAdmin(action.activeProject.id)) {
        userFeeds = action.activeProject.feedSources || []
      } else if (action.user.permissions.hasProjectPermission(action.activeProject.id, state.permissionFilter)) {
        userFeeds = action.activeProject.feedSources ? action.activeProject.feedSources.filter((feed) => {
          return action.user.permissions.hasFeedPermission(action.activeProject.id, feed.id, state.permissionFilter) !== null
        }) : []
      }
      let validatedFeeds = userFeeds.filter((feed) => {
        return feed.latestVersionId !== undefined
      })
      return update(state, {
        allFeeds: {$set: validatedFeeds},
        activeFeeds: {$set: validatedFeeds}
      })
    case 'UPDATE_LOADED_FEEDS':
      return update(state, {
        loadedFeeds: {$set: action.loadedFeeds}
      })
    case 'ADD_ACTIVE_FEED':
      activeFeeds = [
        ...state.activeFeeds,
        action.feed
      ]
      return update(state, {activeFeeds: {$set: activeFeeds}})

    case 'REMOVE_ACTIVE_FEED':
      let foundIndex = state.activeFeeds.findIndex(f => f.id === action.feed.id)
      if (foundIndex !== -1) {
        activeFeeds = [
          ...state.activeFeeds.slice(0, foundIndex),
          ...state.activeFeeds.slice(foundIndex + 1)
        ]
        return update(state, {activeFeeds: {$set: activeFeeds}})
      }
      return update(state, {activeFeeds: {$set: activeFeeds}})

    case 'ADD_ALL_ACTIVE_FEEDS':
      return update(state, {activeFeeds: {$set: state.allFeeds}})

    case 'REMOVE_ALL_ACTIVE_FEEDS':
      return update(state, {activeFeeds: {$set: []}})

    default:
      return state
  }
}

export default gtfsFilter
