import { connect } from 'react-redux'
import {
  setActiveGtfsEntity,
  newGtfsEntity,
  saveActiveGtfsEntity,
  deleteGtfsEntity,
  getGtfsTable,
} from '../actions/editor'
import { getEntityName } from '../util/gtfs'

import EntityList from '../components/EntityList'

const mapStateToProps = (state, ownProps) => {
  const entity =
    state.editor.active && state.editor.active.entity && state.editor.active.entity.id === ownProps.activeEntityId
    ? state.editor.active.entity
    : state.editor.active && state.editor.active.entity && ownProps.activeComponent === 'feedinfo'
    ? state.editor.active.entity
    : null
  let activeEntity = entity
    ? {
        name: getEntityName(ownProps.activeComponent, entity),
        id: entity.id
      }
    : null
  return {
    activeEntity
  }
}

const mapDispatchToProps = (dispatch, ownProps) => { return { } }

const ActiveEntityList = connect(mapStateToProps, mapDispatchToProps)(EntityList)

export default ActiveEntityList
