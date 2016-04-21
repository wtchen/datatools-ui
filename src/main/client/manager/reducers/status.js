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
    case 'DELETING_FEEDVERSION':
      return update(state, { message: { $set: 'Deleting feed version...' }})
    case 'UPLOADING_FEED':
      return update(state, { message: { $set: 'Uploading feed...' }})
    case 'REQUESTING_SYNC':
      return update(state, { message: { $set: 'Syncing feeds...' }})
    case 'RUNNING_FETCH_FEED_FOR_PROJECT':
      return update(state, { message: { $set: 'Updating feeds for project...' }})
    case 'REQUESTING_PUBLIC_FEEDS':
      return update(state, { message: { $set: 'Loading public feeds...' }})
    case 'REQUESTING_VALIDATION_RESULT':
      return update(state, { message: { $set: 'Loading validation result...' }})
    case 'REQUESTING_NOTES':
      return update(state, { message: { $set: 'Loading comments...' }})
    case 'REQUESTING_GTFSPLUS_CONTENT':
      return update(state, { message: { $set: 'Loading GTFS+ data...' }})
    case 'UPLOADING_GTFSPLUS_FEED':
      return update(state, { message: { $set: 'Saving GTFS+ data...' }})
    case 'PUBLISHING_GTFSPLUS_FEED':
      return update(state, { message: { $set: 'Publishing GTFS+ feed...' }})
    case 'VALIDATING_GTFSPLUS_FEED':
      return update(state, { message: { $set: 'Updating GTFS+ validation...' }})

    case 'RECEIVE_PROJECTS':
    case 'RECEIVE_PROJECT':
    case 'RECEIVE_SYNC':
    case 'RECEIVE_FEEDSOURCES':
    case 'RECEIVE_FEEDVERSIONS':
    case 'RECEIVE_FETCH_FEED_FOR_PROJECT':
    case 'RECEIVE_PUBLIC_FEEDS':
    case 'RECEIVE_VALIDATION_RESULT':
    case 'RECEIVE_NOTES_FOR_FEEDVERSION':
    case 'RECEIVE_NOTES_FOR_FEEDSOURCE':
    case 'RECEIVE_GTFSPLUS_CONTENT':
    case 'UPLOADED_GTFSPLUS_FEED':
    case 'RECEIVE_GTFSPLUS_VALIDATION':
      return update(state, { message: { $set: null }})
    default:
      return state
  }
}

export default config
