import along from '@turf/along'
import ll from '@conveyal/lonlat'
import clone from 'lodash.clonedeep'
import lineDistance from 'turf-line-distance'
import lineSliceAlong from '@turf/line-slice-along'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-linestring'
import point from 'turf-point'

import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
import {generateUID} from '../../../common/util/util'
import {POINT_TYPE} from '../../constants'
import {newGtfsEntity} from '../editor'
import {setErrorMessage} from '../../../manager/actions/status'
import {updatePatternGeometry} from '../map'
import {getControlPoints} from '../../selectors'
import {polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import {getTableById} from '../../util/gtfs'
import {
  constructStop,
  controlPointsFromSegments,
  newControlPoint,
  stopToPatternStop,
  recalculateShape,
  getPatternEndPoint,
  projectStopOntoLine,
  street,
  stopToPoint,
  constructPoint
} from '../../util/map'
import {coordinatesFromShapePoints} from '../../util/objects'

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
 */
export function addStopAtPoint (latlng, addToPattern = false, index, activePattern) {
  return function (dispatch, getState) {
    // create stop
    return constructStop(latlng, activePattern.feedId)
      .then(stop => dispatch(newGtfsEntity(activePattern.feedId, 'stop', stop, true, false))
        .then(newStop => {
          if (addToPattern && newStop) {
            // Add stop to end of pattern
            return dispatch(addStopToPattern(activePattern, newStop, index))
              .then(result => newStop)
          }
          return newStop
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
export function addStopAtIntersection (latlng, activePattern, controlPoints) {
  return async function (dispatch, getState) {
    const endPoint = getPatternEndPoint(activePattern, controlPoints)
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
                  // FIXME: Update shape dist traveled
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
export function addStopAtInterval (latlng, activePattern, controlPoints) {
  return function (dispatch, getState) {
    const {data, editSettings} = getState().editor
    if (activePattern.patternStops.length === 0) {
      // Create first stop at click location if no pattern stops exist
      return dispatch(addStopAtPoint(latlng, true, 0, activePattern))
    } else {
      // Extend pattern to point
      const patternStops = [...activePattern.patternStops]
      // Extend pattern to click point
      const endPoint = getPatternEndPoint(activePattern, controlPoints)
      dispatch(extendPatternToPoint(activePattern, endPoint, latlng, null, editSettings.present.stopInterval))
        .then(result => {
          const newStopLatLngs = []
          // Iterate over newly added controlPoints and create stops for each.
          for (let i = controlPoints.length; i < result.controlPoints.length; i++) {
            const controlPoint = result.controlPoints[i]
            const stopLatlng = ll.toLeaflet(controlPoint.point.geometry.coordinates)
            newStopLatLngs.push(stopLatlng)
          }
          // Create new stops at the interval points.
          return Promise.all(newStopLatLngs.map((latlng, i) => dispatch(
            addStopAtPoint(latlng, false, patternStops.length + i, activePattern))
          ))
            .then(newStops => {
              newStops.forEach((s, index) => {
                // Add new stop to pattern stops list
                if (s) {
                  const stopControlPoint = result.controlPoints[controlPoints.length + index]
                  const patternStop = stopToPatternStop(s)
                  // Set pattern stop's shape dist traveled.
                  patternStop.shapeDistTraveled = stopControlPoint.distance
                  patternStops.push(patternStop)
                  // Update stop properties on new control points.
                  stopControlPoint.pointType = POINT_TYPE.STOP
                  stopControlPoint.stopId = s.stop_id
                }
              })
              console.log('updated control points', result)
              dispatch(updatePatternGeometry(result))
              dispatch(updateActiveGtfsEntity(data.active.subEntity, 'trippattern', {patternStops}))
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
            // TODO: switch to adding multiple stops per action (Java controller and action promise need updating)
            // const newStops = await this.addStopsAtPoints(newStopLatLngs)
            // // add new stop to array
            // patternStops = [...patternStops, ...newStops.map(s => stopToPatternStop(s))]
        })
    }
  }
}

export function addStopToPattern (pattern, stop, index) {
  return async function (dispatch, getState) {
    dispatch(addingStopToPattern(pattern, stop, index))
    const {data, editSettings} = getState().editor
    const {followStreets} = editSettings.present
    const {patternStops: currentPatternStops, shape, shapePoints} = pattern
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const patternLine = lineString(coordinatesFromShapePoints(shapePoints))
    const patternStops = [...currentPatternStops]
    // FIXME replace with patternSegments
    const coordinates = shape && shape.coordinates
    const missingIndex = typeof index === 'undefined' || index === null
    const stopSequence = missingIndex ? patternStops.length : index
    const newStop = stopToPatternStop(stop, stopSequence)

    if (missingIndex || index === patternStops.length) {
      console.log('Adding stop to end of pattern.')
      // If there is no index, handle adding stop to end (also a proxy for
      // extending pattern to point).
      // First, add stop to list of pattern stops.
      patternStops.push(newStop)
      dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
      if (coordinates) {
        // If a pattern shape already exists, extend it from the current end
        // point to the new stop.
        const currentEndPoint = ll.toLeaflet(coordinates[coordinates.length - 1])
        const {stop_lon: lng, stop_lat: lat} = stop
        // Extend pattern to the new point. NOTE: This includes saving the
        // pattern.
        return dispatch(extendPatternToPoint(pattern, currentEndPoint, {lng, lat}, stop))
      } else {
        // Otherwise, check if a shape ought to be created. Then, save.
        if (patternStops.length === 2 && followStreets) {
          // Create shape between stops the added stop is the second one and
          // followStreets is enabled. Otherwise, there is no need to create a
          // new shape because it would just be a straight line segment anyways.
          const previousStopId = patternStops[patternStops.length - 2].stopId
          const stops = getTableById(data.tables, 'stop')
          const previousStop = stops.find(s => s.stop_id === previousStopId)
          if (!previousStop) {
            throw new Error(`Stop not found for stop_id ${previousStopId}.`)
          }
          const points = [previousStop, stop]
            .map((stop, index) => ({lng: stop.stop_lon, lat: stop.stop_lat}))
          const patternSegments = await getPolyline(points, true)
          const controlPoints = controlPointsFromSegments(patternStops, patternSegments)
          dispatch(updatePatternGeometry({controlPoints, patternSegments}))
        }
        // Finally, save the updated pattern.
        return dispatch(saveActiveGtfsEntity('trippattern'))
      }
    } else if (index > 0) {
      // If adding stop in middle, splice the stop into the array.
      patternStops.splice(index, 0, newStop)
      dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
      if (coordinates) {
        // Update shape if it exists. No need to update anything besides pattern
        // stops (which already occurred above) if there is no shape. NOTE: the
        // behavior in this code block essentially replaces any surrounding
        // non-stop control points with the new pattern stop and re-routes the
        // shape between it and the surrounding stop control points.
        // Find projected location onto pattern shape.
        const {distanceInMeters, insertPoint} = projectStopOntoLine(stop, patternLine)
        // Add control point in order to copy of current list.
        const controlPoint = newControlPoint(distanceInMeters, insertPoint, {
          // shapePtSequence: insertIndex,
          stopId: stop.stop_id,
          pointType: POINT_TYPE.STOP // 2
        })
        let stopsEncountered = 0
        let previousStopIndex, nextStopIndex
        // Iterate over control points to find previous and next stop control
        // points.
        for (let i = 0; i < controlPoints.length; i++) {
          if (controlPoints[i].pointType === POINT_TYPE.STOP) {
            if (stopsEncountered === index) {
              nextStopIndex = i
              break
            } else {
              previousStopIndex = i
            }
            stopsEncountered++
          }
        }
        // Perform splice operation on cloned control points to remove any
        // control points between the previous and next stop control points and
        // insert new stop control point in their stead.
        const controlPointsToReplace = nextStopIndex - previousStopIndex - 1
        const spliceIndex = nextStopIndex - controlPointsToReplace
        const clonedControlPoints = clone(controlPoints)
        clonedControlPoints.splice(spliceIndex, controlPointsToReplace, controlPoint)
        console.log(`splicing at ${spliceIndex}. Replacing ${controlPointsToReplace}`, controlPoints, clonedControlPoints)
        // Recalculate shape
        let result
        try {
          result = await recalculateShape({
            controlPoints: clonedControlPoints,
            defaultToStraightLine: false,
            editType: 'update',
            followStreets,
            index,
            newPoint: {lng: stop.stop_lon, lat: stop.stop_lat},
            pattern,
            patternCoordinates: patternSegments
          })
        } catch (err) {
          console.log(err)
          dispatch(setErrorMessage({message: `Could not add stop to pattern: ${err}`}))
          return
        }
        // Update pattern geometry
        dispatch(updatePatternGeometry({
          controlPoints: result.updatedControlPoints,
          patternSegments: result.coordinates
        }))
      }
      return dispatch(saveActiveGtfsEntity('trippattern'))
    } else {
      // Handle adding stop to beginning of pattern.
      patternStops.splice(0, 0, newStop)
      dispatch(updateActiveGtfsEntity(pattern, 'trippattern', {patternStops}))
      if (coordinates) {
        // Update shape if coordinates already exist.
        // TODO: Refactor this block to share code with the above strategy (adding
        // stop to middle of pattern).
        let stopsEncountered = 0
        let previousStopIndex, nextStopIndex
        // Iterate over control points to find previous and next stop control
        // points.
        for (let i = 0; i < controlPoints.length; i++) {
          if (controlPoints[i].pointType === POINT_TYPE.STOP) {
            if (stopsEncountered === index + 1) {
              nextStopIndex = i
              break
            } else {
              previousStopIndex = i
            }
            stopsEncountered++
          }
        }
        const controlPointsToReplace = nextStopIndex - previousStopIndex - 1
        // const spliceIndex = nextStopIndex - controlPointsToReplace
        const clonedControlPoints = clone(controlPoints)
        const controlPoint = newControlPoint(0, stopToPoint(stop), {
          stopId: stop.stop_id,
          pointType: POINT_TYPE.STOP // 2
        })
        clonedControlPoints.splice(index, controlPointsToReplace, controlPoint)
        console.log(`splicing at ${index}. Replacing ${controlPointsToReplace}`, controlPoints, clonedControlPoints)
        // Recalculate shape
        let result
        const clonedPatternSegments = clone(patternSegments)
        // Add blank "placeholder" segment to be replaced with new segment
        clonedPatternSegments.splice(0, 0, [])
        try {
          result = await recalculateShape({
            controlPoints: clonedControlPoints,
            defaultToStraightLine: false,
            editType: 'update',
            followStreets,
            index,
            newPoint: {lng: stop.stop_lon, lat: stop.stop_lat},
            pattern,
            patternCoordinates: clonedPatternSegments
          })
        } catch (err) {
          console.log(err)
          dispatch(setErrorMessage({message: `Could not add stop to pattern: ${err}`}))
          return
        }
        // Update pattern geometry
        dispatch(updatePatternGeometry({
          controlPoints: result.updatedControlPoints,
          patternSegments: result.coordinates
        }))
      }
      return dispatch(saveActiveGtfsEntity('trippattern'))
    }
  }
}

/**
 * Extends shape of input pattern from specified end point to new end point,
 * optionally following streets if the setting is enabled.
 */
function extendPatternToPoint (pattern, endPoint, newEndPoint, stop = null, splitInterval = 0) {
  return async function (dispatch, getState) {
    const {followStreets} = getState().editor.editSettings.present
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const clonedControlPoints = clone(controlPoints)
    let newShape
    if (followStreets) {
      newShape = await getPolyline([endPoint, newEndPoint])
    }
    if (!newShape) {
      // Get single coordinate for straight line if polyline fails or if not
      // following streets.
      newShape = [ll.toCoordinates(endPoint), ll.toCoordinates(newEndPoint)]
    }
    const initialDistance = pattern.shape
      ? lineDistance(pattern.shape, 'meters')
      : 0
    const newLineSegment = lineString(newShape)
    const distanceAdded = lineDistance(newLineSegment, 'meters')
    const newPatternSegments = [...patternSegments]
    if (splitInterval > 0) {
      // If split interval is provided (e.g., to add stops at intervals along
      // new segment), split new line segment and add temp control points (later
      // to be assigned stop IDs).
      const numIntervals = Math.floor(distanceAdded / splitInterval)
      let previousDistance = 0
      // Iterate over intervals and store positions for constructing stops
      for (let i = 1; i <= numIntervals; i++) {
        const splitDistance = (i * splitInterval)
        // Default unit for lineSliceAlong is km (meters not supported).
        console.log(`slicing line from ${previousDistance} m to ${splitDistance} m.`, newLineSegment)
        const slicedSegment = lineSliceAlong(newLineSegment, previousDistance / 1000, splitDistance / 1000)
        const newCoords = slicedSegment.geometry.coordinates
        // Push new coordinates to updated pattern segments
        newPatternSegments.push(newCoords)
        // Add stops along new line segment at distance (initial dist +
        // stopInterval)
        const endPoint = point(newCoords[newCoords.length - 1])
        const controlPoint = {
          id: generateUID(),
          point: endPoint,
          // If control points are to become stops, point type and stop ID must
          // be added later (e.g., in addStopAtInterval).
          pointType: POINT_TYPE.ANCHOR,
          distance: initialDistance + splitDistance
        }
        clonedControlPoints.push(controlPoint)
        // Update previous distance
        previousDistance = splitDistance
      }
    } else {
      // If not splitting segment, simply add new shape coordinates.
      newPatternSegments.push(newShape)
    }
    if (stop) {
      // If extending to a stop, add control point for stop.
      if (splitInterval > 0) {
        throw new Error('The stop argument should not be provided in conjunction with a split interval. This will result in redundant control points.')
      }
      const controlPoint = {
        id: generateUID(),
        point: point(ll.toCoordinates(newEndPoint)),
        pointType: POINT_TYPE.STOP,
        distance: initialDistance + distanceAdded,
        stopId: stop.stop_id
      }
      clonedControlPoints.push(controlPoint)
    }
    // Update pattern geometry and control points
    const result = {
      controlPoints: clonedControlPoints,
      patternSegments: newPatternSegments
    }
    if (stop) {
      dispatch(updatePatternGeometry(result))
      await dispatch(saveActiveGtfsEntity('trippattern'))
    }
    return result
  }
}

export function removeStopFromPattern (pattern, stop, index, controlPoints, patternCoordinates) {
  return async function (dispatch, getState) {
    if (!controlPoints || !patternCoordinates) {
      const result = getControlPoints(getState())
      controlPoints = result.controlPoints
      patternCoordinates = result.patternSegments
    }
    const {shapePoints} = pattern
    // let shape
    if (!shapePoints || shapePoints.length === 0) {
      // if pattern has no shape points, don't attempt to refactor pattern shape
      console.log('pattern coordinates do not exist')
    } else {
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
        dispatch(setErrorMessage({message: `Could not remove stop from pattern: ${err}`}))
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
