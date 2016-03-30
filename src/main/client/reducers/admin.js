import update from 'react-addons-update'

const projects = (state = {
  isFetching: false,
  users: null
}, action) => {
  switch (action.type) {
    case 'REQUESTING_USERS':
      return update(state, { isFetching: { $set: true }})
    case 'RECEIVE_USERS':
      return update(state, { isFetching: { $set: false }, users: { $set: action.users }})
      case 'CREATED_USER':
        if (state.users)
          return update(state, { users: { $push: [action.profile] }})
    default:
      return state
  }
}

export default projects
