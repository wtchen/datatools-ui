import { updateUserMetadata } from './user'

export function settingSidebarExpanded (value) {
  return {
    type: 'SETTING_SIDEBAR_EXPANDED',
    value
  }
}

export function setSidebarExpanded (value) {
  return function (dispatch, getState) {
    dispatch(settingSidebarExpanded(value))
    dispatch(updateUserMetadata(getState().user.profile, {sidebar_expanded: value}))
  }
}
