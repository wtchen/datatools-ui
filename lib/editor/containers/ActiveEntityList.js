// @flow

import {connect} from 'react-redux'

import {
  deleteGtfsEntity,
  enterTimetableEditor,
  resetActiveGtfsEntity,
  setActiveEntity,
  updateActiveGtfsEntity
} from '../actions/active'
import {cloneGtfsEntity, newGtfsEntity, updateEntitySort} from '../actions/editor'
import {getTableById} from '../util/gtfs'
import EntityList from '../components/EntityList'
import {findProjectByFeedSource} from '../../manager/util'
import {getActiveEntityList, getActivePatternStops} from '../selectors'

import type {AppState} from '../../types/reducers'

export type Props = {
  activeComponent: string,
  activeEntityId: number,
  feedSourceId: string,
  showConfirmModal: any,
  width: number
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {activeComponent, feedSourceId} = ownProps
  const {sort, tables} = state.editor.data

  // Simplify active entity properties so that EntityList is not re-rendered when
  // any fields on active entity are edited
  const routes = getTableById(tables, 'route')
  const hasRoutes = routes && routes.length > 0
  const list = getActiveEntityList(state)
  const activeEntity = list.find(entity => entity.isActive)
  const entities = activeComponent && getTableById(tables, activeComponent)
  const project = findProjectByFeedSource(state.projects.all, feedSourceId)
  const activePatternStops = getActivePatternStops(state)
  const feedSource = project && project.feedSources && project.feedSources.find(fs => fs.id === feedSourceId)

  return {
    activeEntity,
    activePatternStops,
    entities,
    feedSource,
    hasRoutes,
    list,
    sort
  }
}

const mapDispatchToProps = {
  cloneGtfsEntity,
  deleteGtfsEntity,
  enterTimetableEditor,
  newGtfsEntity,
  resetActiveGtfsEntity,
  setActiveEntity,
  updateActiveGtfsEntity,
  updateEntitySort
}

const ActiveEntityList = connect(mapStateToProps, mapDispatchToProps)(EntityList)

export default ActiveEntityList
