import update from 'react-addons-update'

import { getControlPoints } from '../util/gtfs'
import { CLICK_OPTIONS } from '../util'

const defaultState = {
  editGeometry: false,
  followStreets: true,
  onMapClick: CLICK_OPTIONS[0],
  stopInterval: 400,
  distanceFromIntersection: 5,
  afterIntersection: true,
  intersectionStep: 2,
  snapToStops: true,
  addStops: false,
  hideStops: false,
  controlPoints: [],
  coordinatesHistory: [],
  actions: [],
  patternCoordinates: null
}

const editSettings = (state = defaultState, action) => {
  let stateUpdate, controlPoints, coordinates
  switch (action.type) {
    case 'SETTING_ACTIVE_GTFS_ENTITY':
      switch (action.subComponent) {
        case 'trippattern':
          controlPoints = getControlPoints(action.activeSubEntity, state.snapToStops)
          coordinates = action.activeSubEntity && action.activeSubEntity.shape && action.activeSubEntity.shape.coordinates
          stateUpdate = {
            controlPoints: {$set: [controlPoints]},
            patternCoordinates: {$set: coordinates}
          }
          if (coordinates) {
            stateUpdate.coordinatesHistory = {$set: [coordinates]}
          }
          return update(state, stateUpdate)
        default:
          return state
      }
    case 'UPDATE_PATTERN_COORDINATES':
      return update(state, {
        patternCoordinates: {$set: action.coordinates}
      })
    case 'UPDATE_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          if (action.props && 'shape' in action.props) {
            // add previous coordinates to history
            coordinates = action.entity.shape && action.entity.shape.coordinates
            const newCoordinates = action.props.shape && action.props.shape.coordinates
            if (coordinates) {
              return update(state, {
                coordinatesHistory: {$push: [coordinates]},
                patternCoordinates: {$set: newCoordinates}
              })
            }
          }
          break
        default:
          return state
      }
      return state
    case 'RECEIVE_TRIP_PATTERNS_FOR_ROUTE':
      // set controlPoints initially and then whenever isSnappingToStops changes
      if (action.activePattern) {
        coordinates = action.activePattern.shape && action.activePattern.shape.coordinates
        controlPoints = getControlPoints(action.activePattern, state.snapToStops)
      } else {
        controlPoints = []
      }
      return update(state, {
        controlPoints: {$set: [controlPoints]},
        patternCoordinates: {$set: coordinates},
        coordinatesHistory: {$set: [coordinates]}
      })
    case 'UPDATE_EDIT_SETTING':
      if (action.setting === 'editGeometry' && !state.editGeometry) {
        controlPoints = getControlPoints(action.activePattern, state.snapToStops)
        return update(state, {
          [action.setting]: {$set: action.value},
          controlPoints: {$set: [controlPoints]}
        })
      } else {
        return update(state, {
          [action.setting]: {$set: action.value}
        })
      }
    case 'UNDO_TRIP_PATTERN_EDITS':
      let lastActionIndex = state.actions.length - 1
      let lastActionType = state.actions[lastActionIndex]
      let lastCoordinatesIndex = state.coordinatesHistory.length - 1
      let lastControlPointsIndex = state.controlPoints.length - 1
      stateUpdate = {
        actions: {$splice: [[lastActionIndex, 1]]}
      }
      switch (lastActionType) {
        case 'ADD_CONTROL_POINT':
          stateUpdate.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          break
        case 'UPDATE_CONTROL_POINT':
          stateUpdate.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              subEntity: {shape: {coordinates: {$set: coordinates}}}
            }
          }
          break
        case 'REMOVE_CONTROL_POINT':
          stateUpdate.controlPoints = {$splice: [[lastControlPointsIndex, 1]]}
          stateUpdate.coordinatesHistory = {$splice: [[lastCoordinatesIndex, 1]]}
          coordinates = state.coordinatesHistory[lastCoordinatesIndex]
          if (coordinates) {
            stateUpdate.active = {
              subEntity: {shape: {coordinates: {$set: coordinates}}}
            }
          }
          break
      }
      return update(state, stateUpdate)
    case 'ADD_CONTROL_POINT':
      controlPoints = [...state.controlPoints[state.controlPoints.length - 1]]
      controlPoints.splice(action.index, 0, action.controlPoint)
      return update(state, {
        controlPoints: {$push: [controlPoints]},
        actions: {$push: [action.type]}
      })
    case 'RESET_ACTIVE_GTFS_ENTITY':
      switch (action.component) {
        case 'trippattern':
          coordinates = state.coordinatesHistory[0]
          return update(state, {
            patternCoordinates: {$set: coordinates},
            coordinatesHistory: {$set: [coordinates]}
          })
        default:
          return state
      }
    case 'REMOVE_CONTROL_POINT':
      controlPoints = [...state.controlPoints[state.controlPoints.length - 1]]
      controlPoints.splice(action.index, 1)
      return update(state, {
        controlPoints: {$push: [controlPoints]},
        actions: {$push: [action.type]}
      })
    case 'UPDATE_CONTROL_POINT':
      let newControlPoints = []
      controlPoints = state.controlPoints[state.controlPoints.length - 1]
      for (var i = 0; i < controlPoints.length; i++) {
        newControlPoints.push(Object.assign({}, controlPoints[i]))
      }
      let newest = update(newControlPoints, {[action.index]: {point: {$set: action.point}, distance: {$set: action.distance}}})
      return update(state, {
        controlPoints: {$push: [newest]},
        actions: {$push: [action.type]}
      })
    case 'SAVED_TRIP_PATTERN':
      // set controlPoints initially and then whenever isSnappingToStops changes
      controlPoints = getControlPoints(action.tripPattern, state.snapToStops)
      coordinates = action.tripPattern && action.tripPattern.shape && action.tripPattern.shape.coordinates
      return update(state, {
        controlPoints: {$set: [controlPoints]},
        patternCoordinates: {$set: coordinates},
        coordinatesHistory: {$set: [coordinates]}
      })
    default:
      return state
  }
}

export default editSettings
