// edit active sign actions

export const setActiveTitle = (title) => {
  return {
    type: 'SET_ACTIVE_SIGN_TITLE',
    title
  }
}

export const setActiveDescription = (description) => {
  return {
    type: 'SET_ACTIVE_SIGN_DESCRIPTION',
    description
  }
}

export const setActiveUrl = (url) => {
  return {
    type: 'SET_ACTIVE_SIGN_URL',
    url
  }
}

export const setActiveCause = (cause) => {
  return {
    type: 'SET_ACTIVE_SIGN_CAUSE',
    cause
  }
}

export const setActiveEffect = (effect) => {
  return {
    type: 'SET_ACTIVE_SIGN_EFFECT',
    effect
  }
}

export const setActiveStart = (start) => {
  return {
    type: 'SET_ACTIVE_SIGN_START',
    start
  }
}

export const setActiveEnd = (end) => {
  return {
    type: 'SET_ACTIVE_SIGN_END',
    end
  }
}

export const setActivePublished = (published) => {
  return {
    type: 'SET_ACTIVE_SIGN_PUBLISHED',
    published
  }
}

export const toggleAssociatedSign = (display, draftConfigId) => {
  return {
    type: 'TOGGLE_ASSOCIATED_SIGN',
    display,
    draftConfigId
  }
}

export const updateDisplays = (displays) => {
  return {
    type: 'UPDATE_DISPLAYS',
    displays
  }
}

let nextEntityId = -1
export const addActiveEntity = (field = 'AGENCY', value = null, agency = null) => {
  nextEntityId--
  let newEntity = {
    type: 'ADD_ACTIVE_SIGN_AFFECTED_ENTITY',
    entity: {
      id: nextEntityId,
      type: field
    }
  }
  // set agency of new entity
  if (agency){
    newEntity.entity.agency = agency
  }
  newEntity.entity[field.toLowerCase()] = value
  return newEntity
}

export const deleteActiveEntity = (entity) => {
  return {
    type: 'DELETE_ACTIVE_SIGN_AFFECTED_ENTITY',
    entity
  }
}

export const updateActiveEntity = (entity, field, value, agency) => {
  return {
    type: 'UPDATE_ACTIVE_SIGN_ENTITY',
    entity,
    field,
    value,
    agency
  }
}
