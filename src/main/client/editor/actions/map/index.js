import shp from 'shpjs'
import lineSlice from 'turf-line-slice'
import point from 'turf-point'
import lineDistance from 'turf-line-distance'
import ll from 'lonlng'

import { updateActiveGtfsEntity, saveActiveGtfsEntity } from '../active'
import { handlePatternEdit } from '../../util/map'
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
    let beginPoint = point(pattern.shape.coordinates[0])
    let clickPoint = point(ll.toCoordinates(latlng))
    let lineSegment = lineSlice(beginPoint, clickPoint, pattern.shape)

    // measure line segment
    let distTraveled = lineDistance(lineSegment, 'meters')
    let controlPoint = {distance: distTraveled, point: clickPoint}

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
    let coordinates = await handlePatternEdit(null, begin, end, pattern, followStreets, patternCoordinates)
    // update pattern
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: coordinates}}))
    // remove controlPoint
    dispatch(removingControlPoint(index))
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
    let reader = new window.FileReader()
    reader.onload = e => {
      let arrayBuff = reader.result
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
      newShape = ll.toCoordinates(newEndPoint)
    }
    const updatedShape = {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {shape: updatedShape}))
    await dispatch(saveActiveGtfsEntity('trippattern'))
    return updatedShape
  }
}
