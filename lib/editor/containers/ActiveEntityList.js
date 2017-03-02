import { connect } from 'react-redux'

import { enterTimetableEditor } from '../actions/active'
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
  const route = state.editor.data.tables.route
  const hasRoutes = route && route.length > 0
  return {
    activeEntity,
    hasRoutes
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    enterTimetableEditor: () => dispatch(enterTimetableEditor())
  }
}

const ActiveEntityList = connect(mapStateToProps, mapDispatchToProps)(EntityList)

export default ActiveEntityList
