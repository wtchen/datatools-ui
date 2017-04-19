import shp from 'shpjs'
import lineSlice from 'turf-line-slice'
import point from 'turf-point'
import lineDistance from 'turf-line-distance'
import ll from '@conveyal/lonlat'

import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
import {getControlPointSnap, handlePatternEdit, newControlPoint} from '../../util/map'
import {polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'

export function updateMapSetting (props) {
  return {
    type: 'UPDATE_MAP_SETTING',
    props
  }
}

export function addControlPoint (controlPoint, index) {
  return {
    type: 'ADD_CONTROL_POINT',
    controlPoint,
    index
  }
}

export function handleControlPointDragEnd (index, controlPoint, evt, pattern) {
  return function (dispatch, getState) {
    const coordinates = getState().editor.editSettings.patternCoordinates
    const { snap, distTraveled } = getControlPointSnap(evt, coordinates)
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates}}))
    dispatch(updateControlPoint(index, snap, distTraveled))
  }
}

export function handleControlPointDrag (latlng, previous, next, pattern) {
  return function (dispatch, getState) {
    const { followStreets, patternCoordinates } = getState().editor.editSettings
    const defaultToStraightLine = false
    handlePatternEdit(latlng, previous, next, pattern, followStreets, patternCoordinates, defaultToStraightLine)
    .then(coords => {
      if (coords) {
        dispatch(updatePatternCoordinates(coords))
      }
    })
  }
}

export function removingControlPoint (pattern, index, begin, end) {
  return {
    type: 'REMOVE_CONTROL_POINT',
    pattern,
    index,
    begin,
    end
  }
}

export function constructControlPoint (pattern, latlng, controlPoints) {
  return function (dispatch, getState) {
    // slice line
    const beginPoint = point(pattern.shape.coordinates[0])
    const coord = ll.toCoordinates(latlng)
    const clickPoint = point(coord)
    const lineSegment = lineSlice(beginPoint, clickPoint, pattern.shape)

    // measure line segment
    const distTraveled = lineDistance(lineSegment, 'meters')
    const controlPoint = newControlPoint(distTraveled, clickPoint)

    // find splice index based on shape dist traveled
    let index = 0
    for (var i = 0; i < controlPoints.length; i++) {
      if (distTraveled > controlPoints[i].distance) {
        index = i + 1
      } else {
        break
      }
    }
    // add control point
    dispatch(addControlPoint(controlPoint, index))
  }
}

export function updatePatternCoordinates (coordinates) {
  return {
    type: 'UPDATE_PATTERN_COORDINATES',
    coordinates
  }
}

export function removeControlPoint (pattern, index, begin, end) {
  return async function (dispatch, getState) {
    const { followStreets, patternCoordinates } = getState().editor.editSettings
    const coordinates = await handlePatternEdit(null, begin, end, pattern, followStreets, patternCoordinates)
    // update pattern
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates}}))
    // remove controlPoint
    dispatch(removingControlPoint(pattern, index, begin, end))
  }
}

export function updateControlPoint (index, point, distance) {
  return {
    type: 'UPDATE_CONTROL_POINT',
    index,
    point,
    distance
  }
}

function receivedRoutesShapefile (feedSource, geojson) {
  return {
    type: 'RECEIVED_ROUTES_SHAPEFILE',
    feedSource,
    geojson
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
        dispatch(receivedRoutesShapefile(feedSource, geojson))
      })
    }
    reader.readAsArrayBuffer(file)
  }
}

export function extendPatternToPoint (pattern, endPoint, newEndPoint) {
  return async function (dispatch, getState) {
    let newShape = await getPolyline([endPoint, newEndPoint])

    // get single coordinate if polyline fails
    if (!newShape) {
      newShape = [ll.toCoordinates(newEndPoint)]
    }
    const updatedShape = {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {shape: updatedShape}))
    await dispatch(saveActiveGtfsEntity('trippattern'))
    return updatedShape
  }
}
