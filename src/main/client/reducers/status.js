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
    case 'SAVING_FEEDSOURCE':
      return update(state, { message: { $set: 'Saving feed...' }})
    case 'RECEIVE_PROJECTS':
    case 'RECEIVE_PROJECT':
    case 'RECEIVE_FEEDSOURCES':
      return update(state, { message: { $set: null }})
    default:
      return state
  }
}

export default config
