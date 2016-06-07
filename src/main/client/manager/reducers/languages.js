import update from 'react-addons-update'

const languages = (state = {
  all: DT_CONFIG.messages.all,
  // set active default to english
  active: DT_CONFIG.messages.active,
}, action) => {
  let languageIndex
  switch (action.type) {
    case 'SET_ACTIVE_LANGUAGE':
      languageIndex = state.all.findIndex(l => l.id === action.languageId)
      DT_CONFIG.messages.active = state.all[languageIndex]
      localStorage.setItem('lang', action.languageId)
      return update(state, { active: { $set: state.all[languageIndex] }})
    default:
      return state
  }
}

export default languages
