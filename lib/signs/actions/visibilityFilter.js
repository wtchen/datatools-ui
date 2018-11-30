// @flow

import {createAction, type ActionType} from 'redux-actions'

export const setVisibilityFilter = createAction(
  'SET_SIGN_VISIBILITY_FILTER',
  (payload: string) => payload
)
export const setVisibilitySearchText = createAction(
  'SET_SIGN_VISIBILITY_SEARCH_TEXT',
  (payload: string) => payload
)

export type SignVisibilityFilterActions = ActionType<typeof setVisibilityFilter> |
  ActionType<typeof setVisibilitySearchText>
