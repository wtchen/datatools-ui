import {createAction} from 'redux-actions'

// edit active alert actions
export const setActiveProperty = createAction('SET_ACTIVE_ALERT_PROPERTY')
export const setActivePublished = createAction('SET_ACTIVE_ALERT_PUBLISHED')
export const deleteActiveEntity = createAction('DELETE_ACTIVE_ALERT_AFFECTED_ENTITY')
export const updateActiveEntity = createAction('UPDATE_ACTIVE_ALERT_ENTITY')
// Private action
const newEntity = createAction('ADD_ACTIVE_ALERT_AFFECTED_ENTITY')

// Initialize next entity ID at 0 (increments as new entities are added).
let nextEntityId = 0

export function addActiveEntity (field = 'AGENCY', value = null, agency = null, newEntityId = 0) {
  return function (dispatch, getState) {
    nextEntityId++
    return dispatch(newEntity({
      id: newEntityId || nextEntityId,
      type: field,
      agency,
      [field.toLowerCase()]: value
    }))
  }
}
