import update from 'react-addons-update'

const visibilityFilter = (state = {
  searchText: null
}, action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_SEARCH_TEXT':
      return update(state, {searchText: {$set: action.text}})
    default:
      return state
  }
}

export default visibilityFilter
