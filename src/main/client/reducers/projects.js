import update from 'react-addons-update'

const projects = (state = {
  isFetching: false,
  all: []
}, action) => {
  switch (action.type) {
    case 'CREATE_PROJECT':
      const projects = [{
        isCreating: true,
        name: ''
      }, ...state.all]
      return update(state, { all: { $set: projects }})

    case 'REQUEST_PROJECTS':
      return update(state, { isFetching: { $set: true }})

    case 'RECEIVE_PROJECTS':
      return {
        isFetching: false,
        all: action.projects
      }

    default:
      return state
  }
}

export default projects
