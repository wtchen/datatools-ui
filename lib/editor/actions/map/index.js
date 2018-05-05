import ll from '@conveyal/lonlat'
import clone from 'lodash.clonedeep'
import uniqueId from 'lodash.uniqueid'
import {createAction} from 'redux-actions'
import shp from 'shpjs'
import lineDistance from 'turf-line-distance'
import lineString from 'turf-linestring'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import point from 'turf-point'

import {POINT_TYPE} from '../../constants'
import {setActivePatternSegment} from '../tripPattern'
import {setErrorMessage} from '../../../manager/actions/status'
import {getLineSlices, recalculateShape, newControlPoint} from '../../util/map'

// Simple actions
export const updatePatternGeometry = createAction('UPDATE_PATTERN_GEOMETRY')
const controlPointDragOrEnd = createAction('CONTROL_POINT_DRAG_START_OR_END')
const receivedRoutesShapefile = createAction('RECEIVED_ROUTES_SHAPEFILE')
// Update map setting is used in complex actions and elsewhere (editor components).
export const updateMapSetting = createAction('UPDATE_MAP_SETTING')

// FIXME: replace use of pattern.shape with shape points
export function constructControlPoint ({pattern, latlng, controlPoints, segmentIndex, segmentCoordinates, patternCoordinates}) {
  return function (dispatch, getState) {
    const {patternSegment} = getState().editor.data.active
    // console.log(patternSegment, segmentIndex)
    const patternLine = lineString(segmentCoordinates)
    const coord = ll.toCoordinates(latlng)
    const clickPoint = point(coord)
    // Assign point to location on line (click latlng may not be precise at certain zoom levels)
    const pointOnLine = nearestPointOnLine(patternLine, clickPoint)
    // slice line
    const {beforeSlice, afterSlice} = getLineSlices(patternLine, pointOnLine)

    // measure line segment
    const distTraveled = lineDistance(beforeSlice, 'meters')
    // FIXME: Check that shape pt sequence value here is accurate
    const controlPoint = newControlPoint(distTraveled, pointOnLine, {
      shapePtSequence: beforeSlice.geometry.coordinates.length,
      shapePtLat: pointOnLine.geometry.coordinates[1],
      shapePtLon: pointOnLine.geometry.coordinates[0],
      // User can only add control points for non-stop anchors
      pointType: POINT_TYPE.ANCHOR // 1
    })

    // console.log(controlPoints, controlPoint)

    // Make a copy of the latest set of control points
    const updatedControlPoints = [...controlPoints]
    // Splice in new control point.
    const controlPointIndex = segmentIndex + 1
    updatedControlPoints.splice(controlPointIndex, 0, controlPoint)
    const patternSegments = clone(patternCoordinates)
    // Update item at segmentIndex and insert new segment
    patternSegments.splice(segmentIndex, 1, beforeSlice.geometry.coordinates, afterSlice.geometry.coordinates)
    dispatch(updatePatternGeometry({
      controlPoints: updatedControlPoints,
      patternSegments
    }))
    dispatch(setActivePatternSegment(controlPointIndex))
  }
}

export function displayRoutesShapefile (feedSource, file) {
  return function (dispatch, getState) {
    const reader = new window.FileReader()
    reader.onload = e => {
      const arrayBuff = reader.result
      shp(arrayBuff).then(geojson => {
        console.log(geojson)
        geojson.key = Math.random()
        dispatch(receivedRoutesShapefile({feedSource, geojson}))
      })
    }
    reader.readAsArrayBuffer(file)
  }
}

/**
 * Calculate a new shape according to newly dragged position of control point
 *
 * @param  {ControlPoint[]} controlPoints
 * @param  {Number} index Index of the control point being dragged
 * @param  {Position} latlng  Position of drag point
 * @param  {Object} patternShape
 */
export function handleControlPointDrag (
  controlPoints,
  index,
  latlng,
  pattern,
  patternCoordinates
) {
  return function (dispatch, getState) {
    const {currentDragId, followStreets} = getState().editor.editSettings.present
    recalculateShape({
      controlPoints,
      defaultToStraightLine: false,
      dragId: currentDragId,
      editType: 'update',
      followStreets,
      index,
      newPoint: latlng,
      pattern,
      patternCoordinates
    }).then(result => {
      const {currentDragId} = getState().editor.editSettings.present
      // If there is a dragId in the store and it matches the result, the user
      // is still dragging the control point
      const stillDragging = currentDragId && result.dragId === currentDragId
      if (
        stillDragging &&
        result.coordinates
      ) {
        // console.log('drag result', result.coordinates)
        dispatch(updatePatternGeometry({
          controlPoints: result.updatedControlPoints,
          patternSegments: result.coordinates
        }))
      }
    })
  }
}

export function handleControlPointDragEnd (controlPoints, index, latlng, pattern, patternCoordinates) {
  return function (dispatch, getState) {
    // proclaim end of dragging (with undefined dragId argument)
    dispatch(controlPointDragOrEnd())

    // recalculate shape for final position
    const {followStreets} = getState().editor.editSettings.present
    recalculateShape({
      controlPoints,
      defaultToStraightLine: false,
      editType: 'update',
      index,
      followStreets,
      newPoint: latlng,
      pattern,
      patternCoordinates,
      snapControlPointToNewSegment: true
    }).then(result => {
      // const {updatedShapePoints: shapePoints, updatedControlPoints} = result
      if (!result.coordinates) {
        dispatch(setErrorMessage({
          message: 'An error occurred while trying to recalculate the shape after dragging.  Please try again.'
        }))
      } else {
        // console.log('drag end result', result)
        dispatch(updatePatternGeometry({
          controlPoints: result.updatedControlPoints,
          patternSegments: result.coordinates
        }))
      }
    })
  }
}

/**
 * Save data to store that dragging is in progress
 *
 * @param  {ControlPoint} controlPoint
 * @return {Action}
 */
export function handleControlPointDragStart (controlPoint) {
  return controlPointDragOrEnd(uniqueId(controlPoint.id))
}

export function removeControlPoint (controlPoints, index, pattern, patternCoordinates) {
  return async function (dispatch, getState) {
    const {followStreets} = getState().editor.editSettings.present
    const {
      coordinates,
      updatedControlPoints
    } = await recalculateShape({
      controlPoints,
      editType: 'delete',
      index,
      followStreets,
      pattern,
      patternCoordinates
    })
    // Update active pattern in store (does not save to server).
    dispatch(updatePatternGeometry({
      controlPoints: updatedControlPoints,
      patternSegments: coordinates
    }))
  }
}
