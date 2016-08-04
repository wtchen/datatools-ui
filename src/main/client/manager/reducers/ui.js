import update from 'react-addons-update'

const ui = (state = {
  sidebarExpanded: true
}, action) => {
  switch (action.type) {
    case 'SET_SIDEBAR_EXPANDED':
      return update(state, { sidebarExpanded: { $set: action.value } })
    default:
      return state
  }
}

export default ui
