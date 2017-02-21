import update from 'react-addons-update'
import moment from 'moment'

const gtfsFilter = (state = {
  allFeeds: [],
  activeFeeds: [],
  loadedFeeds: [],
  typeFilter: ['stops', 'routes'],
  map: {
    bounds: [],
    zoom: null
  },
  permissionFilter: 'view-feed',
  version: null,
  dateTimeFilter: {
    date: moment().format('YYYY-MM-DD'),
    from: 60 * 60 * 6,
    to: 60 * 60 * 9
  }
}, action) => {
  // console.log(action)
  let activeFeeds, dateTimeFilter
  switch (action.type) {
    case 'SET_ACTIVE_FEEDVERSION':
      return update(state, {version: {$set: action.feedVersion ? action.feedVersion.id : null}})
    case 'UPDATE_GTFS_MAP_STATE':
      return update(state, {map: {$set: action.props}})
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
      if (action.user.permissions.isProjectAdmin(action.activeProject.id, action.activeProject.organizationId)) {
        userFeeds = action.activeProject.feedSources || []
      } else if (action.user.permissions.hasProjectPermission(action.activeProject.organizationId, action.activeProject.id, state.permissionFilter)) {
        userFeeds = action.activeProject.feedSources ? action.activeProject.feedSources.filter((feed) => {
          return action.user.permissions.hasFeedPermission(action.activeProject.organizationId, action.activeProject.id, feed.id, state.permissionFilter) !== null
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
