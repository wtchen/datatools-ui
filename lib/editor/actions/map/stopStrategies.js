import along from '@turf/along'
import ll from '@conveyal/lonlat'
import clone from 'lodash.clonedeep'
import lineDistance from 'turf-line-distance'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-lineString'
import point from 'turf-point'

import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
import {generateUID} from '../../../common/util/util'
import {POINT_TYPE} from '../../constants'
import {newGtfsEntity} from '../editor'
import {setErrorMessage} from '../../../manager/actions/status'
import {getTableById} from '../../util/gtfs'
import {getControlPoints} from '../../selectors'
import {updatePatternGeometry} from '../map'
import {getSegment, polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import {
  constructStop,
  stopToPatternStop,
  recalculateShape,
  getPatternEndPoint,
  street,
  constructPoint
} from '../../util/map'
import {stopToGtfs} from '../../util/objects'

function addingStopToPattern (pattern, stop, index) {
  return {
    type: 'ADDING_STOP_TO_PATTERN',
    pattern,
    stop,
    index
  }
}

/**
 * Creates a new stop at click location (leaflet latlng) and extends the pattern
 * geometry to the new stop location.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtPoint (latlng, addToPattern = false, index, activePattern) {
  return function (dispatch, getState) {
    // create stop
    return constructStop(latlng, activePattern.feedId)
    .then(stop => dispatch(newGtfsEntity(activePattern.feedId, 'stop', stop, true))
      .then(s => {
        const gtfsStop = stopToGtfs(s)
        // add stop to end of pattern
        if (addToPattern && gtfsStop) {
          return dispatch(addStopToPattern(activePattern, gtfsStop, index))
          .then(result => gtfsStop)
        }
        return gtfsStop
      }))
  }
}

/**
 * Creates new stops at intersections according to edit settings (e.g., distance
 * from intersection, whether it should be on the near or far side of the
 * intersection, etc.) and extends the pattern geometry through the stops.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtIntersection (latlng, activePattern) {
  return async function (dispatch, getState) {
    const endPoint = getPatternEndPoint(activePattern)
    street(endPoint, latlng)
    .then(json => {
      if (json) {
        const extension = [].concat.apply([], json.data.features.map(f => f.geometry.coordinates))
        const patternStops = [...activePattern.patternStops]
        // trim added coordinates from end of existing pattern shape to end of extension
        const last = json.data.features[json.data.features.length - 1]
        const start = constructPoint(endPoint)
        const end = constructPoint(last.geometry.coordinates[last.geometry.coordinates.length - 1])
        // TODO-lineSlice: refactor below code to not use lineSlice
        // the current code may have undesired results in cases where the shape overlaps itself
        const trimmed = lineSlice(start, end, {type: 'Feature', geometry: {type: 'LineString', coordinates: extension}})
        const { afterIntersection, intersectionStep, distanceFromIntersection } = getState().editor.editSettings.present
        const shape = {type: 'LineString', coordinates: [...activePattern.shape.coordinates, ...trimmed.geometry.coordinates]}
        dispatch(updateActiveGtfsEntity(activePattern, 'trippattern', {shape}))
        dispatch(saveActiveGtfsEntity('trippattern'))
        return Promise.all(json.data.features.map((feature, index) => {
          // create stops only at specified step
          if (index % intersectionStep !== 0) {
            return null
          }
          const toVertex = json.vertices.find(v => v.index === feature.properties.toVertex)
          // skip vertex if no intersection exists
          if (toVertex.incidentStreets.length <= 2) {
            return null
          }
          // skip vertex if incidentStreets tags highway !== primary or secondary
          // else if (toVertex) {
          //
          // }

          // modify location according to distanceFromIntersection and before/after
          const start = afterIntersection
            ? constructPoint(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])
            : constructPoint(shape.coordinates[0])
          const end = afterIntersection
            ? constructPoint(shape.coordinates[shape.coordinates.length - 1])
            : constructPoint(feature.geometry.coordinates[feature.geometry.coordinates.length - 1])
          // TODO-lineSlice: refactor below code to use only relevant section of shape with lineSlice
          // the current code may have undesired results in cases where the shape overlaps itself
          const lineFromPoint = lineSlice(start, end, {type: 'Feature', geometry: shape})
          const stopLocation = along(lineFromPoint, distanceFromIntersection / 1000, {units: 'kilometers'})
          const latlng = ll.toLeaflet(stopLocation.geometry.coordinates)
          // const {afterIntersection, intersectionStep, distanceFromIntersection} = getState().editor.editSettings.present
          return dispatch(addStopAtPoint(latlng, false, patternStops.length, activePattern))
        }))
        .then(stops => {
          stops.map(s => {
            // add new stop to array
            if (s) {
              patternStops.push(stopToPatternStop(s))
            }
          })
          // update and save all new stops to pattern
          dispatch(updateActiveGtfsEntity(getState().editor.data.active.subEntity, 'trippattern', {patternStops}))
          return dispatch(saveActiveGtfsEntity('trippattern'))
        })
      }
    })
  }
}

/**
 * Creates new stops at the desired distance interval and extends to pattern
 * geometry to the stop location.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtInterval (latlng, activePattern) {
  return function (dispatch, getState) {
    const {data, editSettings} = getState().editor
    // create first stop if none exist
    if (activePattern.patternStops.length === 0) {
      return dispatch(addStopAtPoint(latlng, true, activePattern))
    } else {
      const patternStops = [...activePattern.patternStops]
      const initialDistance = lineDistance(activePattern.shape, 'meters')

      // extend pattern to click point
      const endPoint = getPatternEndPoint(activePattern)
      dispatch(extendPatternToPoint(activePattern, endPoint, latlng))
      .then(updatedShape => {
        const totalDistance = lineDistance(updatedShape, 'meters')
        const distanceAdded = totalDistance - initialDistance
        const numIntervals = Math.floor(distanceAdded / editSettings.present.stopInterval)
        const latlngList = []
        for (var i = 1; i <= numIntervals; i++) {
          const stopDistance = initialDistance + (i * editSettings.present.stopInterval)

          // add stops along shape at interval (stopInterval)
          const position = along(updatedShape, stopDistance, {units: 'meters'})
          const stopLatlng = ll.toLeaflet(position.geometry.coordinates)
          latlngList.push(stopLatlng)
        }
        return Promise.all(latlngList.map(latlng => {
          // pass patternStops.length as index to ensure pattern not extended to locaton
          return dispatch(addStopAtPoint(latlng, false, patternStops.length, activePattern))
        }))
        .then(stops => {
          stops.map(s => {
            // add new stop to array
            if (s) {
              patternStops.push(stopToPatternStop(s))
            }
          })
          dispatch(updateActiveGtfsEntity(data.active.subEntity, 'trippattern', {patternStops}))
          return dispatch(saveActiveGtfsEntity('trippattern'))
        })
        // TODO: switch to adding multiple stops per action (Java controller and action promise need updating)
        // const newStops = await this.addStopsAtPoints(latlngList)
        // // add new stop to array
        // patternStops = [...patternStops, ...newStops.map(s => stopToPatternStop(s))]
      })
    }
  }
}

export function addStopToPattern (pattern, stop, index) {
  return function (dispatch, getState) {
    dispatch(addingStopToPattern(pattern, stop, index))
    const {data, editSettings} = getState().editor
    const patternStops = [...pattern.patternStops]
    // FIXME replace with patternSegments
    const coordinates = pattern.shape && pattern.shape.coordinates
    const missingIndex = typeof index === 'undefined' || index === null
    const stopSequence = missingIndex ? patternStops.length : index
    const newStop = stopToPatternStop(stop, stopSequence)

    if (missingIndex) {
      // if adding stop to end, also a proxy for extending pattern to point
      if (coordinates) {
        // if shape coordinates already exist, extend them to the new stop.
        const endPoint = ll.toLeaflet(coordinates[coordinates.length - 1])
        patternStops.push(newStop)
        dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
        const {stop_lon: lng, stop_lat: lat} = stop
        return dispatch(extendPatternToPoint(pattern, endPoint, {lng, lat}, stop))
      } else {
        // If shape coordinates do not exist, add pattern stop and get shape
        // between stops (if more than one stops exists).
        patternStops.push(newStop)
        if (patternStops.length > 1) {
          const stops = getTableById(data.tables, 'stop')
          const previousStopId = patternStops[patternStops.length - 2].stopId
          const previousStop = stops.find(s => s.stop_id === previousStopId)
          if (!previousStop) {
            throw new Error(`Stop not found for stop_id ${previousStopId}.`)
          }
          return getSegment([[previousStop.stop_lon, previousStop.stop_lat], [stop.stop_lon, stop.stop_lat]], editSettings.present.followStreets)
            .then(geojson => {
              dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
              // FIXME Update pattern geometry here? Currently, the behavior is
              // that no shape will be created if stops are added to a shapeless
              // pattern. This might be ok because it essentially will not create
              // a shape of any kind unless explicitly asked for. There may be
              // some use cases where this is desired.
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
        } else {
          // If the pattern only contains a single stop, there is no need to
          // draw a shape of any kind.
          dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
          return dispatch(saveActiveGtfsEntity('trippattern'))
        }
      }
      // TODO: construct shape if not following roads
      // updateActiveGtfsEntity(pattern, 'trippattern', {patternStops: patternStops, shape: {type: 'LineString', coordinates: coordinates}})
    } else {
      // if adding stop in middle
      patternStops.splice(index, 0, newStop)
      dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
      return dispatch(saveActiveGtfsEntity('trippattern'))
    }
    // TODO: add strategy for stop at beginning
  }
}

/**
 * Extends shape of input pattern from specified end point to new end point,
 * optionally following streets if the setting is enabled.
 */
function extendPatternToPoint (pattern, endPoint, newEndPoint, stop = null) {
  return async function (dispatch, getState) {
    const {followStreets} = getState().editor.editSettings.present
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const clonedControlPoints = clone(controlPoints)
    let newShape
    if (followStreets) {
      newShape = await getPolyline([endPoint, newEndPoint])
    }
    // get single coordinate for straight line if polyline fails or if not following streets
    if (!newShape) {
      newShape = [ll.toCoordinates(endPoint), ll.toCoordinates(newEndPoint)]
    }
    // append newShape coords to existing pattern coords
    const shape = {type: 'LineString', coordinates: [...pattern.shape.coordinates, ...newShape]}
    // If extending to a stop, add control point for stop
    if (stop) {
      const controlPoint = {
        id: generateUID(),
        point: point(ll.toCoordinates(newEndPoint)),
        pointType: POINT_TYPE.STOP,
        distance: lineDistance(lineString(newShape), 'meters'),
        stopId: stop.stop_id
      }
      clonedControlPoints.push(controlPoint)
    }
    // Update pattern geometry and control points
    dispatch(updatePatternGeometry({
      controlPoints: clonedControlPoints,
      patternSegments: [...patternSegments, newShape]
    }))
    await dispatch(saveActiveGtfsEntity('trippattern'))
    return shape
  }
}

export function removeStopFromPattern (pattern, stop, index, controlPoints, patternCoordinates) {
  return async function (dispatch, getState) {
    if (!controlPoints || !patternCoordinates) {
      const result = getControlPoints(getState())
      controlPoints = result.controlPoints
      patternCoordinates = result.patternSegments
    }

    // let shape
    // if pattern shape is null, don't attempt to refactor pattern shape
    if (!patternCoordinates || patternCoordinates.length === 0) {
      // FIXME: Update pattern segments?
      // shape = null
    } else {
      // FIXME: USE cpIndex?
      // else, reconstruct pattern shape to splice line segment
      // let controlPointStopIdx = -1
      // Find the control point index for
      // const cpIndex = controlPoints.findIndex(cp => {
      //   // Increment control point stop index if cp references a stop
      //   if (cp.stopId) controlPointStopIdx++
      //   return (
      //     // If the stop IDs match and the original index matches the control
      //     // point stop index, we have a match
      //     cp.stopId === stop.id &&
      //     controlPointStopIdx === index
      //   )
      // })

      const {followStreets} = getState().editor.editSettings.present

      let result
      try {
        result = await recalculateShape({
          controlPoints,
          editType: 'delete',
          index, // FIXME this index needs to be offset by non-stop control points : cpIndex,
          followStreets,
          pattern,
          patternCoordinates
        })
      } catch (err) {
        console.log(err)
        dispatch(setErrorMessage({message: `Could not remove pattern from stop: ${err}`}))
        return
      }
      if (!result.coordinates) {
        // Last stop was removed?, set coordinates to null.
        console.warn('Coordinates from recalculating shape are null.')
        // shape = null
      } else {
        // FIXME
        // shape = {type: 'LineString', coordinates}
      }
      // Update pattern geometry
      dispatch(updatePatternGeometry({
        controlPoints: result.updatedControlPoints,
        patternSegments: result.coordinates
      }))
    }
    // Update pattern stops (whether or not geometry exists)
    const patternStops = [...pattern.patternStops]
    patternStops.splice(index, 1)
    dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
    // saving the trip pattern will recalculate the control points
    // FIXME: Is the above comment still true? Control points are handled by selector.
    dispatch(saveActiveGtfsEntity('trippattern'))
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
