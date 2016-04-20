// visibilityFilter

export const setVisibilitySearchText = (text) => {
  return {
    type: 'SET_ALERT_VISIBILITY_SEARCH_TEXT',
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_ALERT_VISIBILITY_FILTER',
    filter
  }
}
