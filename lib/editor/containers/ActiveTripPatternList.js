import {connect} from 'react-redux'
import {
  updateEditSetting,
  setActiveEntity,
  deleteGtfsEntity,
  saveActiveGtfsEntity,
  updateActiveGtfsEntity,
  resetActiveGtfsEntity
} from '../actions/active'
import {
  newGtfsEntity,
  updateMapSetting,
  cloneGtfsEntity
} from '../actions/editor'
import {addStopToPattern, removeStopFromPattern} from '../actions/map/stopStrategies'
import {updatePatternGeometry} from '../actions/map'
import {setErrorMessage} from '../../manager/actions/status'
import {
  resnapStops,
  setActiveStop,
  setActivePatternSegment,
  togglePatternEditing,
  undoActiveTripPatternEdits
} from '../actions/tripPattern'
import {findProjectByFeedSource} from '../../manager/util'

import TripPatternList from '../components/pattern/TripPatternList'
import {getTableById} from '../util/gtfs'
import {getControlPoints} from '../selectors'

const mapStateToProps = (state, ownProps) => {
  const {data, editSettings, mapState} = state.editor
  const {active, tables, status} = data
  const stops = getTableById(tables, 'stop')
  const {
    subEntity: activePattern,
    entity: activeEntity,
    feedSourceId,
    subEntityId: activePatternId
  } = active
  // find the containing project
  const project = findProjectByFeedSource(state.projects.all, feedSourceId)
  const {controlPoints, patternSegments} = getControlPoints(state)
  // const patternSegments = getPatternCoordinates(state)
  const {patternSegment} = state.editor.data.active
  const feedSource = project &&
    project.feedSources.find(fs => fs.id === feedSourceId)

  const patternEdited = Boolean(active.patternEdited)
  const patternStop = active.patternStop || {}

  return {
    activeEntity,
    activePattern,
    activePatternId,
    controlPoints,
    editSettings,
    feedSource,
    mapState,
    patternEdited,
    patternSegments,
    patternSegment,
    patternStop,
    status,
    stops
  }
}

const mapDispatchToProps = {
  // Generic GTFS/editor functions
  updateEditSetting,
  updateMapSetting,
  setActiveEntity,
  updateActiveEntity: updateActiveGtfsEntity,
  resetActiveEntity: resetActiveGtfsEntity,
  deleteEntity: deleteGtfsEntity,
  saveActiveEntity: saveActiveGtfsEntity,
  cloneEntity: cloneGtfsEntity,
  newGtfsEntity,
  // Trip pattern specific actions
  addStopToPattern,
  removeStopFromPattern,
  resnapStops,
  setActivePatternSegment,
  setActiveStop,
  setErrorMessage,
  togglePatternEditing,
  undoActiveTripPatternEdits,
  updatePatternGeometry
}

const ActiveTripPatternList = connect(mapStateToProps, mapDispatchToProps)(TripPatternList)

export default ActiveTripPatternList
