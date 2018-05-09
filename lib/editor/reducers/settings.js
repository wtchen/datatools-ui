import update from 'react-addons-update'

import { CLICK_OPTIONS } from '../util'

export const defaultState = {
  addStops: false,
  afterIntersection: true,
  controlPoints: null,
  currentDragId: null,
  distanceFromIntersection: 5,
  editGeometry: false,
  followStreets: true,
  hideInactiveSegments: false,
  intersectionStep: 2,
  onMapClick: CLICK_OPTIONS[0],
  patternCoordinates: null,
  patternSegments: null,
  shapePoints: null,
  showStops: true,
  showTooltips: true,
  hideStopHandles: true,
  stopInterval: 400
}

export const reducers = {
  'CONTROL_POINT_DRAG_START_OR_END' (state, action) {
    return update(state, {
      currentDragId: {$set: action.payload}
    })
  },
  // 'RESNAP_STOPS' (state, action) {
  //   // Sets the control points and shape points to null in order to re-slice
  //   // the pattern shape.
  //   return update(state, {
  //     controlPoints: {$set: null},
  //     shapePoints: {$set: null}
  //   })
  // },
  'SAVED_TRIP_PATTERN' (state, action) {
    // set controlPoints initially and then whenever isSnappingToStops changes
    // const coordinates = coordinatesFromShapePoints(action.payload.tripPattern.shapePoints)
    return update(state, {
      shapePoints: {$set: action.payload.tripPattern.shapePoints}
    })
  },
  'SETTING_ACTIVE_GTFS_ENTITY' (state, action) {
    const {activeSubEntity, subComponent} = action.payload
    switch (subComponent) {
      case 'trippattern':
        const shapePoints = activeSubEntity
          ? activeSubEntity.shapePoints
          : null
        if (shapePoints) {
          return update(state, {shapePoints: {$set: shapePoints}})
        }
        break
      default:
        return state
    }
  },
  'TOGGLE_PATTERN_EDITING' (state, action) {
    return {
      ...defaultState,
      editGeometry: action.payload
    }
  },
  'UPDATE_TEMP_PATTERN_GEOMETRY' (state, action) {
    return update(state, {
      controlPoints: {$set: action.payload.controlPoints},
      patternSegments: {$set: action.payload.patternSegments}
    })
  },
  'UPDATE_PATTERN_GEOMETRY' (state, action) {
    return update(state, {
      controlPoints: {$set: action.payload.controlPoints},
      patternSegments: {$set: action.payload.patternSegments}
    })
  },
  'UPDATE_EDIT_SETTING' (state, action) {
    return update(state, {
      [action.setting]: {$set: action.value}
    })
  }
}
