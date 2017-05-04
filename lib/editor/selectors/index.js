import {createSelector} from 'reselect'
import {getEditorTable} from '../util'
import {validate} from '../util/validation'
import {getEntityName} from '../util/gtfs'

const getActiveEntity = (state) => state.editor.data.active.entity

const getActiveId = createSelector(
  [state => state.editor.data.active.entity],
  (entity) => entity ? entity.id : undefined
)

const getActiveComponent = (state) => state.editor.data.active.component

const getActiveTable = createSelector(
  [getActiveComponent, state => state.editor.data.tables],
  (component, tableData) => tableData[component]
)

export const getValidationErrors = createSelector(
  [ getActiveComponent, getActiveEntity, getActiveTable, state => state.editor.data.tables ],
  (component, entity, entities, tableData) => {
    return getEditorTable(component) && entity
    ? getEditorTable(component).fields
      .map((field, colIndex) => validate(field, entity[field.name], entities, entity, tableData))
      .filter(e => e)
    : []
  }
)

export const getActiveEntityList = createSelector(
  [ getActiveId, getActiveComponent, getActiveTable ],
  (activeId, component, entities) => {
    return entities && entities.length
      ? entities.map((entity, index) => {
        const {id} = entity
        const isActive = activeId && id === activeId
        const name = getEntityName(component, entity) || '[Unnamed]'
        return {name, id, isActive}
      })
      : []
  }
)
