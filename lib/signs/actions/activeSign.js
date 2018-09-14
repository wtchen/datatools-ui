// @flow

import {createAction, type ActionType} from 'redux-actions'

const addAffectedEntity = createAction(
  'ADD_ACTIVE_SIGN_AFFECTED_ENTITY',
  (payload: {
    agency?: any,
    id: number,
    type: string
  }) => payload
)
export const deleteActiveEntity = createAction(
  'DELETE_ACTIVE_SIGN_AFFECTED_ENTITY',
  (payload: any) => payload
)
export const toggleConfigForDisplay = createAction(
  'TOGGLE_CONFIG_FOR_DISPLAY',
  (payload: {
    configId: string,
    configType: string,
    display: string
  }) => payload
)
export const updateActiveEntity = createAction(
  'UPDATE_ACTIVE_SIGN_ENTITY',
  (payload: {
    agency: string,
    entity: any,
    field: string,
    value: any
  }) => payload
)
export const updateActiveSignProperty = createAction(
  'UPDATE_ACTIVE_SIGN_PROPERTY',
  (payload: { key: string, value: any }) => payload
)

export type ActiveSignActions = ActionType<typeof addAffectedEntity> |
  ActionType<typeof deleteActiveEntity> |
  ActionType<typeof toggleConfigForDisplay> |
  ActionType<typeof updateActiveEntity> |
  ActionType<typeof updateActiveSignProperty>

let nextEntityId = 0
export function addActiveEntity (
  field: string = 'AGENCY',
  value: ?any = null,
  agency: ?string = null,
  newEntityId: ?number = 0
) {
  nextEntityId++
  const newEntity = {}
  newEntity.id = newEntityId || nextEntityId
  newEntity.type = field

  // set agency of new entity
  if (agency) {
    newEntity.agency = agency
  }
  newEntity[field.toLowerCase()] = value
  return addAffectedEntity(newEntity)
}
