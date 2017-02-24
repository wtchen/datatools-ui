// visibilityFilter

export const setVisibilitySearchText = (text) => {
  return {
    type: 'SET_SIGN_VISIBILITY_SEARCH_TEXT',
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_SIGN_VISIBILITY_FILTER',
    filter
  }
}
