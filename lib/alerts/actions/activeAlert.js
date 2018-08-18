// @flow

import {createAction} from 'redux-actions'

import type {dispatchFn, getStateFn} from '../../types/reducers'

// edit active alert actions
export const setActiveProperty = createAction('SET_ACTIVE_ALERT_PROPERTY')
export const setActivePublished = createAction('SET_ACTIVE_ALERT_PUBLISHED')
export const deleteActiveEntity = createAction('DELETE_ACTIVE_ALERT_AFFECTED_ENTITY')
export const updateActiveEntity = createAction('UPDATE_ACTIVE_ALERT_ENTITY')
// Private action
const newEntity = createAction('ADD_ACTIVE_ALERT_AFFECTED_ENTITY')

// Initialize next entity ID at 0 (increments as new entities are added).
let nextEntityId = 0

export function addActiveEntity (field: string = 'AGENCY', value: any = null, agency: any = null, newEntityId: number = 0) {
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
