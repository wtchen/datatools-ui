import {connect} from 'react-redux'

import {enterTimetableEditor} from '../actions/active'
import {updateEntitySort} from '../actions/editor'
import {getTableById} from '../util/gtfs'
import EntityList from '../components/EntityList'
import {getActiveEntityList} from '../selectors'

const mapStateToProps = (state, ownProps) => {
  const {sort, tables} = state.editor.data
  // const {entity} = active
  // console.log(ownProps.activeEntityId, active.entity)
  // const entity =
  //   active && active.entity && active.entity.id === ownProps.activeEntityId
  //   ? active.entity
  //   : active && active.entity && ownProps.activeComponent === 'feedinfo'
  //   ? active.entity
  //   : null

  // Simplify active entity properties so that EntityList is not re-rendered when
  // any fields on active entity are edited
  const routes = getTableById(tables, 'route')
  const hasRoutes = routes && routes.length > 0
  const list = getActiveEntityList(state)
  const activeEntity = list.find(entity => entity.isActive)
  // console.log(list, activeEntity)

  return {
    activeEntity,
    hasRoutes,
    list,
    sort
  }
}

const mapDispatchToProps = {
  enterTimetableEditor,
  updateEntitySort
}

const ActiveEntityList = connect(mapStateToProps, mapDispatchToProps)(EntityList)

export default ActiveEntityList
