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
    dispatch(updateUserMetadata(getState().user.profile, {sidebarExpanded: value}))
  }
}

export function settingTutorialHidden (value) {
  return {
    type: 'SETTING_TUTORIAL_HIDDEN',
    value
  }
}

export function setTutorialHidden (value) {
  return function (dispatch, getState) {
    dispatch(settingTutorialHidden(value))
    dispatch(updateUserMetadata(getState().user.profile, {hideTutorial: value}))
  }
}
