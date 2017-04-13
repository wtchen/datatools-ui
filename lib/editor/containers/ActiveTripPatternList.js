import { connect } from 'react-redux'
import {
  updateEditSetting,
  setActiveGtfsEntity,
  deleteGtfsEntity,
  saveActiveGtfsEntity,
  updateActiveGtfsEntity,
  resetActiveGtfsEntity } from '../actions/active'
import {
  newGtfsEntity,
  updateMapSetting,
  cloneGtfsEntity } from '../actions/editor'
import {
  // removeStopFromPattern,
  // addStopAtPoint,
  // addStopAtIntersection,
  // addStopAtInterval,
  addStopToPattern } from '../actions/map/stopStrategies'
import { setErrorMessage } from '../../manager/actions/status'
import { undoActiveTripPatternEdits } from '../actions/tripPattern'
import { findProjectByFeedSource } from '../../manager/util'

import TripPatternList from '../components/pattern/TripPatternList'

const mapStateToProps = (state, ownProps) => {
  const mapState = state.editor.mapState
  const editSettings = state.editor.editSettings
  const stops = state.editor.data.tables.stop
  const activePattern = state.editor.data.active.subEntity
  const feedSourceId = state.editor.data.active.feedSourceId
  // find the containing project
  const project = findProjectByFeedSource(state, feedSourceId)
  const feedSource = project && project.feedSources.find(fs => fs.id === feedSourceId)

  const activeEntity = state.editor.data.active.entity
  // const subSubComponent = state.editor.data.active.subSubComponent
  const activePatternId = state.editor.data.active.subEntityId

  return {
    mapState,
    editSettings,
    stops,
    activePattern,
    feedSource,
    activeEntity,
    activePatternId
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

    // NEW GENERIC GTFS/EDITOR FUNCTIONS
    updateEditSetting: (setting, value, activePattern) => dispatch(updateEditSetting(setting, value, activePattern)),
    updateMapSetting: (props) => dispatch(updateMapSetting(props)),
    setActiveEntity: (feedSourceId, component, entity, subComponent, subEntity, subSubComponent, subSubEntity) => {
      const entityId = entity && entity.id
      const subEntityId = subEntity && subEntity.id
      const subSubEntityId = subSubEntity && subSubEntity.id
      dispatch(setActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
    },
    updateActiveEntity: (entity, component, props) => {
      dispatch(updateActiveGtfsEntity(entity, component, props))
    },
    resetActiveEntity: (entity, component) => {
      dispatch(resetActiveGtfsEntity(entity, component))
    },
    deleteEntity: (feedSourceId, component, entityId, routeId) => {
      dispatch(deleteGtfsEntity(feedSourceId, component, entityId, routeId))
    },
    saveActiveEntity: (component) => {
      return dispatch(saveActiveGtfsEntity(component))
    },
    cloneEntity: (feedSourceId, component, entityId, save) => {
      dispatch(cloneGtfsEntity(feedSourceId, component, entityId, save))
    },
    newGtfsEntity: (feedSourceId, component, props, save) => {
      return dispatch(newGtfsEntity(feedSourceId, component, props, save))
    },

    addStopToPattern: (pattern, stop, index) => dispatch(addStopToPattern(pattern, stop, index)),
    undoActiveTripPatternEdits: () => { dispatch(undoActiveTripPatternEdits()) },
    setErrorMessage: (message) => { dispatch(setErrorMessage(message)) }
  }
}

const ActiveTripPatternList = connect(mapStateToProps, mapDispatchToProps)(TripPatternList)

export default ActiveTripPatternList
