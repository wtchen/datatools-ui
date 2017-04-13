// visibilityFilter

export const setVisibilitySearchText = (text) => {
  return {
    type: 'SET_PROJECT_VISIBILITY_SEARCH_TEXT',
    text
  }
}

export const setVisibilityFilter = (filter) => {
  return {
    type: 'SET_PROJECT_VISIBILITY_FILTER',
    filter
  }
}

export const setAlertAgencyFilter = (feedId) => {
  return {
    type: 'SET_ALERT_AGENCY_FILTER',
    feedId
  }
}

export const setAlertSort = (sort) => {
  return {
    type: 'SET_ALERT_SORT',
    sort
  }
}
