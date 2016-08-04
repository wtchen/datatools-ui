import update from 'react-addons-update'
import { getUserMetadataProperty } from '../../common/util/user'

const ui = (state = {
  sidebarExpanded: true
}, action) => {
  switch (action.type) {
    case 'USER_LOGGED_IN':
      const sidebarExpanded = getUserMetadataProperty(action.profile, 'sidebarExpanded')
      return update(state, {
        sidebarExpanded: { $set: sidebarExpanded }
      })
    case 'SETTING_SIDEBAR_EXPANDED':
      return update(state, { sidebarExpanded: { $set: action.value } })
    default:
      return state
  }
}

export default ui
