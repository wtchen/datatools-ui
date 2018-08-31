// @flow

import update from 'react-addons-update'

import type {Action} from '../../types/actions'
import type {ActiveSign} from '../../types/reducers'

export const defaultState = {active: null}

/* eslint-disable complexity */
const active = (state: ActiveSign = defaultState, action: Action): ActiveSign => {
  let affectedEntities, entities, foundIndex, displayIndex
  switch (action.type) {
    case 'UPDATE_ACTIVE_SIGN':
      return update(state, {active: {$set: action.payload}})
    case 'CREATE_SIGN':
    case 'EDIT_SIGN':
      return update(state, {active: {$set: action.payload}})
    case 'UPDATE_ACTIVE_SIGN_PROPERTY':
      const {key, value: val} = action.payload
      return update(state, {active: {[key]: {$set: val}}})
    case 'RECEIVED_RTD_DISPLAYS':
      if (state.active) {
        const displayMap = {}
        for (var i = 0; i < action.payload.length; i++) {
          const d = action.payload[i]
          if (!d.DraftDisplayConfigurationId && !d.PublishedDisplayConfigurationId) {
            continue
          }
          if (d.DraftDisplayConfigurationId) {
            if (displayMap[d.DraftDisplayConfigurationId] && displayMap[d.DraftDisplayConfigurationId].findIndex(display => display.Id === d.Id) === -1) {
              displayMap[d.DraftDisplayConfigurationId].push(d)
            } else if (!displayMap[d.DraftDisplayConfigurationId]) {
              displayMap[d.DraftDisplayConfigurationId] = []
              displayMap[d.DraftDisplayConfigurationId].push(d)
            }
          }
          if (d.PublishedDisplayConfigurationId) {
            if (displayMap[d.PublishedDisplayConfigurationId] && displayMap[d.PublishedDisplayConfigurationId].findIndex(display => display.Id === d.Id) === -1) {
              displayMap[d.PublishedDisplayConfigurationId].push(d)
            } else if (!displayMap[d.PublishedDisplayConfigurationId]) {
              displayMap[d.PublishedDisplayConfigurationId] = []
              displayMap[d.PublishedDisplayConfigurationId].push(d)
            }
          }
        }
        return update(state, {
          active: {
            displays: {
              $set: state.active ? displayMap[state.active.id] : undefined
            }
          }
        })
      } else {
        return state
      }
    case 'RECEIVED_SIGN_GTFS_ENTITIES':
      // TODO: update GTFS entities for active sign
      if (state.active && state.active.affectedEntities) {
        affectedEntities = state.active.affectedEntities
        for (let i = 0; i < action.payload.length; i++) {
          const ent = action.payload[i]
          if (typeof ent.gtfs !== 'undefined' && ent.SignId === state.active.id) {
            // let sign = action.gtfsSigns.find(a => a.id === ent.entity.SignId)
            const updatedEntity = affectedEntities.find(e => e.id === ent.entity.Id)
            if (!updatedEntity) {
              console.warn(`could not find entity with id ${ent.entity.Id} to update`)
              continue
            }
            updatedEntity[ent.type] = ent.gtfs

            // entities.push(selectedEnt)
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
          }
        }
        return update(state, {active: {affectedEntities: {$set: entities}}})
      }
      return state
    case 'ADD_ACTIVE_SIGN_AFFECTED_ENTITY':
      entities = [...(state.active ? state.active.affectedEntities || [] : []), action.payload]
      return update(state, {active: {affectedEntities: {$set: entities}}})
    case 'TOGGLE_CONFIG_FOR_DISPLAY':
      const {configId, configType, display} = action.payload
      if (!state.active) {
        return state
      }
      displayIndex = state.active.displays.findIndex(d => d.Id === display.Id)
      switch (configType) {
        case 'DRAFT':
          return update(state, {
            active: {
              displays: {
                [displayIndex]: {
                  $merge: {
                    DraftDisplayConfigurationId: configId
                  }
                }
              }
            }
          })
        case 'PUBLISHED':
          // if setting published config to new value (not null), set draft config to null
          // if (configId)
          //   return update(state, {active: {displays: {[displayIndex]: {$merge: {PublishedDisplayConfigurationId: configId, DraftDisplayConfigurationId: null}}}}})
          // else {
          return update(state, {active: {displays: {[displayIndex]: {$merge: {PublishedDisplayConfigurationId: configId}}}}})
          // }
      }
      return state
    case 'UPDATE_ACTIVE_SIGN_ENTITY':
      const {agency, entity, field, value} = action.payload
      if (!state.active) {
        console.warn('no active sign set, unable to update active sign')
        return state
      }
      affectedEntities = state.active.affectedEntities
      foundIndex = affectedEntities.findIndex(e => e.id === entity.id)
      if (foundIndex !== -1) {
        let updatedEntity
        switch (field) {
          case 'TYPE':
            updatedEntity = update(entity, {
              type: {$set: value},
              stop: {$set: null},
              route: {$set: null},
              stop_id: {$set: null},
              route_id: {$set: null}
            })
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
            return update(state, {active: {affectedEntities: {$set: entities}}})
          case 'AGENCY':
            updatedEntity = update(entity, {agency: {$set: value}})
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
            return update(state, {active: {affectedEntities: {$set: entities}}})
          case 'MODE':
            updatedEntity = update(entity, {mode: {$set: value}})
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
            return update(state, {active: {affectedEntities: {$set: entities}}})
          case 'STOP':
            const stopId = value !== null ? value.stop_id : null
            if (entity.type === 'STOP') {
              updatedEntity = update(entity, {
                stop: {$set: value},
                stop_id: {$set: stopId},
                agency: {$set: agency},
                route: {$set: null},
                route_id: {$set: null}
                // TODO: update agency id from feed id?
              })
            } else {
              updatedEntity = update(entity, {
                stop: {$set: value},
                stop_id: {$set: stopId},
                agency: {$set: agency}
                // TODO: update agency id from feed id?
              })
            }
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
            return update(state, {active: {affectedEntities: {$set: entities}}})
          case 'ROUTES':
            updatedEntity = update(entity, {
              route: {$set: value}
            })
            entities = [
              ...affectedEntities.slice(0, foundIndex),
              updatedEntity,
              ...affectedEntities.slice(foundIndex + 1)
            ]
            return update(state, {active: {affectedEntities: {$set: entities}}})
        }
      }
      return state
    case 'DELETE_ACTIVE_SIGN_AFFECTED_ENTITY':
      if (!state.active) {
        console.warn('no active sign set, unable to update active sign')
        return state
      }
      affectedEntities = state.active.affectedEntities
      foundIndex = affectedEntities.findIndex(e => e.id === entity.id)
      if (foundIndex !== -1) {
        entities = [
          ...affectedEntities.slice(0, foundIndex),
          ...affectedEntities.slice(foundIndex + 1)
        ]
        return update(state, {active: {affectedEntities: {$set: entities}}})
      }
      return state
    default:
      return state
  }
}

export default active
