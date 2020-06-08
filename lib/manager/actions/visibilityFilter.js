// @flow

import {createAction, type ActionType} from 'redux-actions'

export const setVisibilitySearchText = createAction(
  'SET_PROJECT_VISIBILITY_SEARCH_TEXT',
  (payload: null | string) => payload
)
export const setVisibilityFilter = createAction(
  'SET_PROJECT_VISIBILITY_FILTER',
  (payload: any) => payload
)

export type VisibilityFilterActions = ActionType<typeof setVisibilitySearchText> |
  ActionType<typeof setVisibilityFilter>
