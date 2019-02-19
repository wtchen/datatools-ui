// @flow

import {createAction, type ActionType} from 'redux-actions'

import type {AlertEntity} from '../../types'
import type {dispatchFn, getStateFn} from '../../types/reducers'

export const deleteActiveEntity = createAction(
  'DELETE_ACTIVE_ALERT_AFFECTED_ENTITY',
  (payload: any) => payload
)
const newEntity = createAction(
  'ADD_ACTIVE_ALERT_AFFECTED_ENTITY',
  (payload: {
    agency: any,
    id: number,
    type: string,
    [string]: any
  }) => payload
)
export const setActiveProperty = createAction(
  'SET_ACTIVE_ALERT_PROPERTY',
  (payload: { [string]: any }) => payload
)
export const setActivePublished = createAction(
  'SET_ACTIVE_ALERT_PUBLISHED',
  (payload: boolean) => payload
)
export const updateActiveEntity = createAction(
  'UPDATE_ACTIVE_ALERT_ENTITY',
  (payload: {
    agency?: any,
    entity: AlertEntity,
    field: string,
    value: any
  }) => payload
)

export type ActiveAlertActions = ActionType<typeof deleteActiveEntity> |
  ActionType<typeof newEntity> |
  ActionType<typeof setActiveProperty> |
  ActionType<typeof setActivePublished> |
  ActionType<typeof updateActiveEntity>

// Initialize next entity ID at 0 (increments as new entities are added).
let nextEntityId = 0

export function addActiveEntity (
  field: string = 'AGENCY',
  value: any = null,
  agency: any = null,
  newEntityId: ?number = 0
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    nextEntityId++
    return dispatch(newEntity({
      id: newEntityId || nextEntityId,
      type: field,
      agency,
      [field.toLowerCase()]: value
    }))
  }
}
