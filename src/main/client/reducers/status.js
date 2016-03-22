import update from 'react-addons-update'

const config = (state = {
  message: null
}, action) => {
  switch (action.type) {
    case 'REQUESTING_PROJECTS':
      return update(state, { message: { $set: 'Loading projects...' }})
    case 'SAVING_PROJECT':
      return update(state, { message: { $set: 'Saving project...' }})
    case 'RECEIVE_PROJECTS':
      return update(state, { message: { $set: null }})
    default:
      return state
  }
}

export default config
