// @flow

import { addingLocationPolygonPt, updatingLocationPolygon } from '../active'
import {
  constructPolygonPoint
  // controlPointsFromSegments,
  // newControlPoint,
  // stopToPatternStop,
  // recalculateShape,
  // getPatternEndPoint,
  // projectStopOntoLine,
  // street,
  // stopToPoint,
  // constructPoint
} from '../../util/map'
import type {dispatchFn, getStateFn} from '../../../types/reducers'

/**
 * Adds a new polygon point at click location (leaflet latlng) and extends the pattern
 * geometry to the new stop location.
 */
export function addLocationPolygonPoint (
  latlng: LatLng
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    // create location polygon point
    const pt = constructPolygonPoint(latlng)
    dispatch(addingLocationPolygonPt(pt))
  }
}

/**
 * Updates the locationPolygons with any moved or removed points.
 */
export function updateLocationPolygon (
  editedPolygons: Array
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(updatingLocationPolygon(editedPolygons))
  }
}
