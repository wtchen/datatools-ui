import update from 'react-addons-update'

const config = (state = {
  message: null
}, action) => {
  switch (action.type) {
    case 'REQUESTING_PROJECTS':
      return update(state, { message: { $set: 'Loading projects...' }})
    case 'REQUESTING_PROJECT':
      return update(state, { message: { $set: 'Loading project...' }})
    case 'SAVING_PROJECT':
      return update(state, { message: { $set: 'Saving project...' }})
    case 'REQUESTING_FEEDSOURCES':
      return update(state, { message: { $set: 'Loading feeds...' }})
    case 'REQUESTING_FEEDSOURCE':
      return update(state, { message: { $set: 'Loading feed...' }})
    case 'SAVING_FEEDSOURCE':
      return update(state, { message: { $set: 'Saving feed...' }})
    case 'DELETING_FEEDSOURCE':
      return update(state, { message: { $set: 'Deleting feed...' }})
    case 'RUNNING_FETCH_FEED':
      return update(state, { message: { $set: 'Updating feed...' }})
    case 'REQUESTING_FEEDVERSIONS':
      return update(state, { message: { $set: 'Loading feed versions...' }})
    case 'UPLOADING_FEED':
      return update(state, { message: { $set: 'Uploading feed...' }})
    case 'REQUESTING_SYNC':
      return update(state, { message: { $set: 'Syncing feeds...' }})
    case 'RUNNING_FETCH_FEED_FOR_PROJECT':
      return update(state, { message: { $set: 'Updating feeds for project...' }})

    case 'RECEIVE_PROJECTS':
    case 'RECEIVE_PROJECT':
    case 'RECEIVE_SYNC':
    case 'RECEIVE_FEEDSOURCES':
    case 'RECEIVE_FEEDVERSIONS':
    case 'RECEIVE_FETCH_FEED_FOR_PROJECT':
      return update(state, { message: { $set: null }})
    default:
      return state
  }
}

export default config
