import shp from 'shpjs'
import pointOnLine from 'turf-point-on-line'
import lineSlice from 'turf-line-slice'
import point from 'turf-point'
import lineDistance from 'turf-line-distance'
import lineString from 'turf-linestring'
import ll from 'lonlng'

import { updateActiveEntity, saveActiveEntity } from '../active'
import {polyline as getPolyline, getSegment} from '../../../scenario-editor/utils/valhalla'

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

export function removeControlPoint (pattern, index, begin, end, polyline) {
  return async function (dispatch, getState) {
    let coordinates = await dispatch(handlePatternEdit(null, begin, end, polyline, pattern))
    // update pattern
    dispatch(updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: coordinates}}))
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

export function handleControlPointDragEnd (e, timer, controlPoint, controlPointIndex, polyline, pattern) {
  return function (dispatch, getState) {
    let geojson = polyline.leafletElement.toGeoJSON()
    // this.refs[this.props.pattern.id]

    // snap control point to line
    let controlPointLocation = e.target.toGeoJSON()
    let snapPoint = pointOnLine(geojson, controlPointLocation)
    controlPoint.leafletElement.setLatLng(ll.toLatlng(snapPoint.geometry.coordinates))
    // this.refs[controlPointRef]

    dispatch(updateActiveEntity(pattern, 'trippattern', {shape: {type: 'LineString', coordinates: geojson.geometry.coordinates}}))

    if (typeof controlPointIndex !== 'undefined') {
      let lineSegment = lineSlice(point(geojson.geometry.coordinates[0]), snapPoint, geojson)

      // measure line segment
      let distTraveled = lineDistance(lineSegment, 'meters')
      dispatch(updateControlPoint(controlPointIndex, snapPoint, distTraveled))
      // var stateUpdate = { controlPoints: {[controlPointIndex]: {point: { $set : snapPoint }, distance: {$set: distTraveled} }}}
      // this.setState(update(this.state, stateUpdate))
    }
    // clear timer
    if (timer) clearInterval(timer)
  }
}

export async function extendPatternToPoint (pattern, endPoint, newEndPoint) {
  return async function (dispatch, getState) {
    let newShape = await getPolyline([endPoint, newEndPoint])

    // get single coordinate if polyline fails
    if (!newShape) {
      newShape = ll.toCoordinates(newEndPoint)
    }
    const updatedShape = {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}
    dispatch(updateActiveEntity(pattern, 'trippattern', {shape: updatedShape}))
    await dispatch(saveActiveEntity('trippattern'))
    return updatedShape
  }
}

export async function handlePatternEdit (controlPoint, begin, end, polyline, pattern) {
  return async function (dispatch, getState) {
    let followRoad = getState().editor.editSettings.followStreets // !e.originalEvent.shiftKey
    let leafletPattern = polyline.leafletElement
    // this.refs[this.props.pattern.id]
    let originalLatLngs
    let originalEndPoint
    let from, to
    let markerLatLng

    if (controlPoint !== null) {
      markerLatLng = controlPoint.leafletElement.getLatLng()
    }

    // set from, to for endPoint if we have markerLatLng
    if (begin && markerLatLng) {
      from = begin
      to = [markerLatLng.lng, markerLatLng.lat]
    } else if (begin) { // set just from (when controlPoint is removed)
      from = begin
    } else if (end) { // set from for beginPoint
      from = [markerLatLng.lng, markerLatLng.lat]
      // TODO: this.state.newLatLngs should no longer exist anywhere, but this is just commented out for now
    // } else if (this.state.newLatLngs) { // if pattern has been previously edited, use that endpoint
    //   originalLatLngs = this.state.newLatLngs
    //   originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
    //   from = [originalEndPoint.lng, originalEndPoint.lat]
    } else { // otherwise use the original endpoint
      originalLatLngs = pattern.shape.coordinates.map(c => ([c[1], c[0]]))
      originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
      from = [originalEndPoint[1], originalEndPoint[0]] // [latLngs[latLngs.length - 1].lng, latLngs[latLngs.length - 1].lat]
      to = [markerLatLng.lng, markerLatLng.lat]
    }

    let latLngs = leafletPattern.toGeoJSON().geometry.coordinates

    if (from) {
      let points = [
        from.geometry ? from.geometry.coordinates : from
      ]
      if (to) {
        points.push(to)
      }
      if (end) {
        points.push(end.geometry.coordinates)
      }
      let newCoordinates
      let newSegment = await getSegment(points, followRoad)
      let originalSegment = lineString(latLngs)

      // slice line if middle control point
      if (end && begin) {
        let beginPoint = point(latLngs[0])
        let beginSlice = lineSlice(beginPoint, from, originalSegment)
        let endPoint = point(latLngs[latLngs.length - 1])
        let endSlice = lineSlice(end, endPoint, originalSegment)
        newCoordinates = [
          ...beginSlice.geometry.coordinates,
          ...newSegment.coordinates,
          ...endSlice.geometry.coordinates
        ]
      } else if (end) { // handle begin control point
        let endPoint = point(latLngs[latLngs.length - 1])
        let endSlice = lineSlice(end, endPoint, originalSegment)
        newCoordinates = [
          ...newSegment.coordinates,
          ...endSlice.geometry.coordinates
        ]
      } else { // append latlngs if end control point
        let beginPoint = point(latLngs[0])
        let beginSlice = lineSlice(beginPoint, from, originalSegment)
        newCoordinates = [
          ...beginSlice.geometry.coordinates,
          ...newSegment.coordinates
        ]
      }
      let leafletCoords = newCoordinates.map(coord => ll.fromCoordinates(coord))
      leafletPattern.setLatLngs(leafletCoords)
      // // add last coordinate as "stop"
      // let endPoint = newPath[newPath.length - 1]
      // // this.setState({patternStops: })

      return leafletCoords // newCoordinates
    }
  }
}

function removingStopFromPattern (pattern, stop, index, controlPoints, polyline) {
  return {
    type: 'REMOVING_STOP_FROM_PATTERN',
    pattern,
    stop,
    index,
    controlPoints,
    polyline
  }
}

export async function removeStopFromPattern (pattern, stop, index, controlPoints, polyline) {
  return async function (dispatch, getState) {
    dispatch(removingStopFromPattern(pattern, stop, index, controlPoints, polyline))
    const cpIndex = controlPoints.findIndex(cp => cp.stopId === stop.id)
    let begin = controlPoints[cpIndex - 2] ? controlPoints[cpIndex - 1].point : null
    let end = controlPoints[cpIndex + 2] ? controlPoints[cpIndex + 1].point : null
    let coordinates = await dispatch(handlePatternEdit(null, begin, end, polyline, pattern))
    let patternStops = [...pattern.patternStops]
    patternStops.splice(index, 1)
    dispatch(updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}}))
    dispatch(saveActiveEntity('trippattern'))
  }
}
