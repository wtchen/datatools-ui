import along from 'turf-along'
import ll from 'lonlng'
import lineDistance from 'turf-line-distance'

import { constructStop, stopToStopTime } from '../../util/map'
import { stopToGtfs } from '../../util/gtfs'
import { extendPatternToPoint } from '../map'
import { updateActiveEntity, saveActiveEntity } from '../active'
// import { newGtfsEntities } from '../editor'
import {getSegment} from '../../../scenario-editor/utils/valhalla'

export async function addStopAtPoint (latlng, addToPattern = false, index, activePattern) {
  return async function (dispatch, getState) {
    // create stop
    const stop = await constructStop(latlng, activePattern.feedId)
    const s = await this.props.newGtfsEntity(activePattern.feedId, 'stop', stop, true)
    const gtfsStop = stopToGtfs(s)
    // add stop to end of pattern
    if (addToPattern) {
      await dispatch(addStopToPattern(activePattern, gtfsStop, index))
    }
    return gtfsStop
  }
}

export async function addStopAtIntersection (latlng, activePattern) {
  return async function (dispatch, getState) {
    console.log('adding stop at intersection!')
    // TODO: implement intersection strategy
    // 1. extend pattern to click point
    // 2. get intersections from OSRM
    // 3. add stops at intersections (using afterIntersection, intersectionStep, distanceFromIntersection)
  }
}

export async function addStopAtInterval (latlng, activePattern) {
  return async function (dispatch, getState) {
    // create first stop if none exist
    if (activePattern.patternStops.length === 0) {
      dispatch(addStopAtPoint(latlng, true, activePattern))
    } else {
      let coordinates = activePattern.shape && activePattern.shape.coordinates
      let patternStops = [...activePattern.patternStops]
      let initialDistance = lineDistance(activePattern.shape, 'meters')

      // extend pattern to click point
      let endPoint
      if (coordinates) {
        endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
      } else {
        endPoint = {lng: patternStops[0].stop_lon, lat: patternStops[0].stop_lat}
      }
      const updatedShape = await dispatch(extendPatternToPoint(activePattern, endPoint, latlng))
      let totalDistance = lineDistance(activePattern.shape, 'meters')
      let distanceAdded = totalDistance - initialDistance
      let numIntervals = distanceAdded / getState().editor.editSettings.stopInterval
      const latlngList = []
      for (var i = 1; i < numIntervals; i++) {
        let stopDistance = initialDistance + i * getState().editor.editSettings.stopInterval

        // add stops along shape at interval (stopInterval)
        let position = along(updatedShape, stopDistance, 'meters')
        let stopLatlng = ll.toLatlng(position.geometry.coordinates)
        latlngList.push(stopLatlng)

        // pass patternStops.length as index to ensure pattern not extended to locaton
        const newStop = await dispatch(addStopAtPoint(stopLatlng, false, patternStops.length, activePattern))
        // add new stop to array
        patternStops.push(stopToStopTime(newStop))
      }
      // TODO: switch to adding multiple stops per action (Java controller and action promise need updating)
      // const newStops = await this.addStopsAtPoints(latlngList)
      // // add new stop to array
      // patternStops = [...patternStops, ...newStops.map(s => stopToStopTime(s))]

      // update and save all new stops to pattern
      updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
      saveActiveEntity('trippattern')
    }
  }
}

export async function addStopToPattern (pattern, stop, index) {
  return async function (dispatch, getState) {
    let patternStops = [...pattern.patternStops]
    let coordinates = pattern.shape && pattern.shape.coordinates
    let newStop = stopToStopTime(stop)
    // if adding stop to end, also a proxy for extending pattern to point
    if (typeof index === 'undefined' || index === null) {
      // if shape coordinates already exist, just extend them
      if (coordinates) {
        let endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
        patternStops.push(newStop)
        updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
        // saveActiveEntity('trippattern')
        extendPatternToPoint(pattern, endPoint, {lng: stop.stop_lon, lat: stop.stop_lat})
      } else { // if shape coordinates do not exist, add pattern stop and get shape between stops (if multiple stops exist)
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          let previousStop = getState().editor.data.tables.stops.find(s => s.id === patternStops[patternStops.length - 2].stopId)
          console.log(previousStop)
          let geojson = await getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], getState().editor.editSettings.followStreets)
          updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: geojson.coordinates}})
          saveActiveEntity('trippattern')
        } else {
          updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
          saveActiveEntity('trippattern')
        }
      }
      // if not following roads
      // updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    } else { // if adding stop in middle
      patternStops.splice(index, 0, newStop)
      updateActiveEntity(pattern, 'trippattern', {patternStops: patternStops})
      saveActiveEntity('trippattern')
    }
    // TODO: add strategy for stop at beginning
  }
}

// async function addStopsAtPoints (latlngList) {
//   return async function (dispatch, getState) {
//     const stops = []
//     for (var i = 0; i < latlngList.length; i++) {
//       const stop = await constructStop(latlngList[i], this.props.feedSource.id)
//       stops.push(stop)
//     }
//     const newStops = await dispatch(newGtfsEntities(this.props.feedSource.id, 'stop', stops, true))
//     return newStops.map(s => stopToGtfs(s))
//   }
// }
