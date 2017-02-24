import { connect } from 'react-redux'

import { getEntityName } from '../util/gtfs'
import EntityList from '../components/EntityList'

const mapStateToProps = (state, ownProps) => {
  const entity =
    state.editor.data.active && state.editor.data.active.entity && state.editor.data.active.entity.id === ownProps.activeEntityId
    ? state.editor.data.active.entity
    : state.editor.data.active && state.editor.data.active.entity && ownProps.activeComponent === 'feedinfo'
    ? state.editor.data.active.entity
    : null
  const activeEntity = entity
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
