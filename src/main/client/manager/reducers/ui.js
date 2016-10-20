import update from 'react-addons-update'
import { getUserMetadataProperty } from '../../common/util/user'

const ui = (state = {
  sidebarExpanded: true,
  hideTutorial: false
}, action) => {
  switch (action.type) {
    case 'USER_LOGGED_IN':
      const hideTutorial = getUserMetadataProperty(action.profile, 'hideTutorial')
      const sidebarExpanded = getUserMetadataProperty(action.profile, 'sidebarExpanded')
      return update(state, {
        sidebarExpanded: { $set: sidebarExpanded },
        hideTutorial: { $set: hideTutorial },
      })
    case 'SETTING_TUTORIAL_VISIBILITY':
      return update(state, { hideTutorial: { $set: action.value } })
    case 'SETTING_SIDEBAR_EXPANDED':
      return update(state, { sidebarExpanded: { $set: action.value } })
    default:
      return state
  }
}

export default ui
