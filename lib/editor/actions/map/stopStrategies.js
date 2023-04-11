// @flow

import 'array.prototype.move'
import along from '@turf/along'
import ll from '@conveyal/lonlat'
import clone from 'lodash/cloneDeep'
import lineDistance from 'turf-line-distance'
import lineSliceAlong from '@turf/line-slice-along'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-linestring'
import point from 'turf-point'

import {updateActiveGtfsEntity, saveActiveGtfsEntity} from '../active'
import {updatePatternStops} from '../tripPattern'
import {generateUID} from '../../../common/util/util'
import { getStopsFromControlPoints } from '../../components/map/pattern-debug-lines'
import {POINT_TYPE} from '../../constants'
import {newGtfsEntity} from '../editor'
import {setErrorMessage} from '../../../manager/actions/status'
import {updatePatternGeometry} from '../map'
import {getControlPoints} from '../../selectors'
import {getSegment, polyline as getPolyline} from '../../../scenario-editor/utils/valhalla'
import {getTableById} from '../../util/gtfs'
import {stopToGeoJSONPoint,
  constructStop,
  controlPointsFromSegments,
  newControlPoint,
  stopToPatternStop,
  recalculateShape,
  getPatternEndPoint,
  street,
  stopToPoint,
  constructPoint
} from '../../util/map'
import type {ControlPoint, Coordinates, GtfsStop, LatLng, Pattern, PatternStop} from '../../../types'
import type {dispatchFn, getStateFn} from '../../../types/reducers'

/**
 * Creates a new stop at click location (leaflet latlng) and extends the pattern
 * geometry to the new stop location.
 */
export function addStopAtPoint (
  latlng: LatLng,
  addToPattern: boolean = false,
  index: ?number,
  activePattern: Pattern
) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    // create stop
    return constructStop(latlng)
      .then(stop => dispatch(newGtfsEntity(null, 'stop', stop, true, false))
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
 * Adds values in range to array. Used to help add elements to controlPoints array
 */
const addRangeToArray = (array: Array<number>, startIndex: number, numberToAdd: number): Array<number> => {
  const range = [...Array(numberToAdd).keys()].map(x => x + startIndex)
  array.push(...range)
  return array
}

/**
 * Creates new stops at intersections according to edit settings (e.g., distance
 * from intersection, whether it should be on the near or far side of the
 * intersection, etc.) and extends the pattern geometry through the stops.
 *
 * FIXME for the SQL editor version
 */
export function addStopAtIntersection (
  latlng: LatLng,
  activePattern: Pattern,
  controlPoints?: Array<ControlPoint>
) {
  return async function (dispatch: dispatchFn, getState: getStateFn) {
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
          const trimmed = lineSlice(
            start,
            end,
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: extension
              }
            }
          )
          const {
            afterIntersection,
            distanceFromIntersection,
            intersectionStep
          } = getState().editor.editSettings.present
          const shape = {
            type: 'LineString',
            coordinates: [
              ...activePattern.shape.coordinates,
              ...trimmed.geometry.coordinates
            ]
          }
          // $FlowFixMe lots of flow errors on setting pattern as entity.
          dispatch(updateActiveGtfsEntity({
            component: 'trippattern',
            entity: activePattern,
            props: {shape}
          }))
          dispatch(saveActiveGtfsEntity('trippattern'))
          return Promise.all(json.data.features.map((feature, index) => {
            // create stops only at specified step
            if (index % intersectionStep !== 0) {
              return null
            }
            const toVertex = json.vertices.find(v => v.index === feature.properties.toVertex)
            // Skip vertex if not found. TODO: Check that this is the correct behavior.
            if (!toVertex) return null
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
              dispatch(updatePatternStops(activePattern, patternStops))
              return dispatch(saveActiveGtfsEntity('trippattern'))
            })
        }
      })
  }
}

/**
 * Creates new stops at the desired distance interval and extends to pattern
 * geometry to the stop location.
 */
export function addStopAtInterval (latlng: LatLng, activePattern: Pattern, controlPoints: Array<ControlPoint>) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const {editSettings} = getState().editor
    if (activePattern.patternStops.length === 0) {
      // Create first stop at click location if no pattern stops exist
      return dispatch(addStopAtPoint(latlng, true, 0, activePattern))
    } else {
      // Extend pattern to point
      const patternStops = [...activePattern.patternStops]
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
              dispatch(updatePatternStops(activePattern, patternStops))
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

export function addStopToPattern (pattern: Pattern, stop: GtfsStop, index?: ?number) {
  return async function (dispatch: dispatchFn, getState: getStateFn) {
    const {data, editSettings} = getState().editor
    const {avoidMotorways, followStreets} = editSettings.present
    const {patternStops: currentPatternStops, shapePoints} = pattern
    const patternStops = clone(currentPatternStops)
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const hasShapePoints = shapePoints && shapePoints.length > 1
    const newStop = stopToPatternStop(
      stop,
      (typeof index === 'undefined' || index === null)
        ? patternStops.length
        : index
    )
    if (typeof index === 'undefined' || index === null || index === patternStops.length) {
      // Push pattern stop to cloned list.
      patternStops.push(newStop)
      if (hasShapePoints) {
        // console.log('extending pattern to new stop', stop)
        // If a pattern shape already exists, extend it from the current end
        // point to the new stop.
        const {shapePtLon, shapePtLat} = shapePoints[shapePoints.length - 1]
        const currentEndPoint = ll.toLeaflet([shapePtLon, shapePtLat])
        const {stop_lon: lng, stop_lat: lat} = stop
        // Extend pattern to the new point.
        return dispatch(extendPatternToPoint(pattern, currentEndPoint, {lng, lat}, stop))
          .then(result => {
            // Update pattern stops and pattern geometry together. This ensures
            // that a recalcuation of the control points / pattern segments does
            // not cause issues when the pattern stops quantity does not match
            // the control points. TODO: add optional pattern stops to update pattern
            // geometry, so that these are more closely bound.
            dispatch(updatePatternStops(pattern, patternStops))
            dispatch(updatePatternGeometry(result))
            return dispatch(saveActiveGtfsEntity('trippattern'))
          })
      } else {
        dispatch(updatePatternStops(pattern, patternStops))
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
          const patternSegments = await getPolyline(points, true, avoidMotorways)
          // Update pattern stops and geometry.
          const controlPoints = controlPointsFromSegments(patternStops, patternSegments)
          dispatch(updatePatternGeometry({controlPoints, patternSegments}))
        }
        // Finally, save the updated pattern.
        return dispatch(saveActiveGtfsEntity('trippattern'))
      }
    } else if (index > 0) {
      // If adding stop in middle, splice the stop into the array.
      patternStops.splice(index, 0, newStop)
      dispatch(updatePatternStops(pattern, patternStops))
      if (hasShapePoints) {
        // Update shape if it exists. No need to update anything besides pattern
        // stops (which already occurred above) if there is no shape. NOTE: the
        // behavior in this code block essentially replaces any
        // non-stop control points in the "from" segment with the new pattern stop and re-routes the
        // shape between it and the new stop.
        // Non-stop control points are preserved in the new "to" segment.
        //     ↙️ "from" segment      ↙️ "to" segment
        //  0 ——x——— 0 ——————————x———x——— 0
        //             ^— 0 —^ <--- new inserted stop

        // Add control point in order to copy of current list.
        const stopControlPoints = getStopsFromControlPoints(controlPoints)

        // Perform splice operation on cloned control points to remove any
        // control points between the previous and next stop control points and
        // insert new stop control point in their stead.
        const clonedControlPoints = clone(controlPoints)
        const clonedPatternSegments = clone(patternSegments)

        // Insert the new stop after the previous stopControlPoint.
        // We assume that all control points hold for the "to" semgent (see above).
        const previousStopControlPoint = stopControlPoints[index - 1]
        const spliceIndex = previousStopControlPoint.cpIndex + 1
        const nextControlPoint = clonedControlPoints[spliceIndex]

        // Previously, at this point we had created our control point by projecting the stop onto the existing shape.
        // However, this created problems for insertions where the stop is geographically before the previous stop
        // but is being inserted after it in the stop sequence. We were projecting previously bc to create a control point
        // we need to know the distance along the shape, but to avoid the above issue we need to make a sub-request to graphhopper
        // to get the segment between the two points and from that, the distance.
        const insertPoint = stopToGeoJSONPoint(stop)
        const newFromSegmentCoords = [
          previousStopControlPoint.point.geometry.coordinates,
          [stop.stop_lon, stop.stop_lat]
        ]

        // We wrap more of the code in this try block because the pre-calculated "newFromSegment" can fail in the same way
        // as recalculate shape.
        let result
        try {
          const newFromSegment = await getSegment(newFromSegmentCoords, true)
          const segmentDistance = lineDistance(newFromSegment, 'meters')
          const addedControlPoint = newControlPoint(
            previousStopControlPoint.distance + segmentDistance,
            insertPoint,
            {
              stopId: stop.stop_id,
              pointType: POINT_TYPE.STOP // 2
            })
          // Instead of splicing at the previousStopControlPoint, splice immediately after.
          clonedControlPoints.splice(spliceIndex, 0, addedControlPoint)

          // Replace n segments with 2 segments to be replaced
          // with new routed segments.
          clonedPatternSegments.splice(
            previousStopControlPoint.cpIndex,
            1,
            [previousStopControlPoint.point.geometry.coordinates, insertPoint.geometry.coordinates],
            [insertPoint.geometry.coordinates, nextControlPoint.point.geometry.coordinates]
          )

          // TODO: Because we are pre-generating the from segment above, we could use that in the final recalculated shape.
          // Right now, bc of the legacy method we are repeating that small amount of work.
          result = await recalculateShape({
            avoidMotorways,
            controlPoints: clonedControlPoints,
            defaultToStraightLine: false,
            editType: 'update',
            followStreets,
            index: spliceIndex,
            newPoint: {lng: stop.stop_lon, lat: stop.stop_lat},
            snapControlPointToNewSegment: true,
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
    } else {
      // Handle adding stop to beginning of pattern.
      patternStops.splice(0, 0, newStop)
      dispatch(updatePatternStops(pattern, patternStops))
      if (hasShapePoints) {
        // Update shape if coordinates already exist.
        const clonedControlPoints = clone(controlPoints)
        const controlPoint = newControlPoint(0, stopToPoint(stop), {
          stopId: stop.stop_id,
          pointType: POINT_TYPE.STOP // 2
        })
        clonedControlPoints.splice(index, 0, controlPoint)
        // Recalculate shape
        let result
        const clonedPatternSegments = clone(patternSegments)
        // Add blank "placeholder" segment to be replaced with new segment
        clonedPatternSegments.splice(0, 0, [])
        try {
          result = await recalculateShape({
            avoidMotorways: avoidMotorways,
            controlPoints: clonedControlPoints,
            defaultToStraightLine: false,
            editType: 'update',
            followStreets,
            index,
            newPoint: {lng: stop.stop_lon, lat: stop.stop_lat},
            snapControlPointToNewSegment: true,
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
 *
 * TODO: Refactor to use recalculate shape?
 */
function extendPatternToPoint (pattern, endPoint, newEndPoint, stop = null, splitInterval = 0) {
  return async function (dispatch: dispatchFn, getState: getStateFn) {
    const {avoidMotorways, followStreets} = getState().editor.editSettings.present
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const clonedControlPoints = clone(controlPoints)
    let newShape
    if (followStreets) {
      newShape = await getPolyline([endPoint, newEndPoint], false, avoidMotorways)
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
        // console.log(`slicing line from ${previousDistance} m to ${splitDistance} m.`, newLineSegment)
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
        // $FlowFixMe
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
      const snappedPoint = point(newShape[newShape.length - 1])
      const controlPoint = {
        id: generateUID(),
        point: snappedPoint, // point(ll.toCoordinates(newEndPoint)),
        pointType: POINT_TYPE.STOP,
        distance: initialDistance + distanceAdded,
        stopId: stop.stop_id
      }
      // $FlowFixMe
      clonedControlPoints.push(controlPoint)
    }
    // Return updated pattern geometry and control points
    return {
      controlPoints: clonedControlPoints,
      patternSegments: newPatternSegments
    }
  }
}

export function removeStopFromPattern (pattern: Pattern, stop: GtfsStop, index: number) {
  return async function (dispatch: dispatchFn, getState: getStateFn) {
    const {controlPoints, patternSegments} = getControlPoints(getState())
    const clonedControlPoints = clone(controlPoints)
    const clonedPatternSegments = clone(patternSegments)
    const {shapePoints} = pattern
    const patternStops = [...pattern.patternStops]
    // Use control points to determine control point index for removed stop.
    // This is distinct from the index arg supplied because there may be more
    // control points than pattern stops, causing a mismatch in the indexes.
    const stopControlPoints = controlPoints
      // TODO: refactor into shared function (see pattern-debug-lines.js)
      .map((cp, index) => ({...cp, cpIndex: index}))
      .filter(cp => cp.pointType === POINT_TYPE.STOP)
    const {cpIndex} = stopControlPoints[index]
    console.log(`deleting control point at index ${cpIndex}`)
    if (!shapePoints || shapePoints.length === 0) {
      // If pattern has no shape points, don't attempt to refactor pattern shape
      console.log('pattern coordinates do not exist')
    } else {
      const {avoidMotorways, followStreets} = getState().editor.editSettings.present
      let result
      try {
        result = await recalculateShape({
          avoidMotorways,
          controlPoints: clonedControlPoints,
          editType: 'delete',
          index: cpIndex,
          followStreets,
          patternCoordinates: clonedPatternSegments
        })
      } catch (err) {
        console.log(err)
        dispatch(setErrorMessage({message: `Could not remove stop from pattern: ${err}`}))
        return
      }
      if (!result.coordinates) {
        // Last stop was removed?, set coordinates to null.
        console.warn('Coordinates from recalculating shape are null.')
        dispatch(setErrorMessage({message: `Could not remove stop from pattern:`}))
        return
      }
      // Update pattern geometry
      dispatch(updatePatternGeometry({
        controlPoints: result.updatedControlPoints,
        patternSegments: result.coordinates
      }))
    }
    // Update pattern stops (whether or not geometry exists)
    patternStops.splice(index, 1)
    dispatch(updatePatternStops(pattern, patternStops))
    dispatch(saveActiveGtfsEntity('trippattern'))
  }
}

/**
 * Based on the provided starting point for deletion and the number of segments until we hit another stop,
 * this function calculates the number of control points and adds the control points and segments to the array
 * for later deletion.
 */
const updateControlPointsAndSegments = (deletedControlPoints: Array<number>, deletedSegments: Array<number>, deletionStartIndex: number, numberSegments: number): Array<Array<number>> => {
  // Each control point creates 2 segments, so you have one less control point than segments.
  const numberControlPoints = numberSegments - 1
  // Add control points and segments to the list to delete and return
  return [
    addRangeToArray(deletedControlPoints, deletionStartIndex + 1, numberControlPoints), // Add one for immediate next control point.
    addRangeToArray(deletedSegments, deletionStartIndex, numberSegments)
  ]
}

/**
 * Generates a new segment for the fromPoint and toPoint and inserts it into the new patternSegments array.
 */
const generateSegmentAndInsert = async (clonedPatternSegments: Array<Coordinates>, fromPoint: ?ControlPoint, toPoint: ?ControlPoint, insertionPoint: number) => {
  if (!fromPoint || !toPoint) return
  const points = [fromPoint.point.geometry.coordinates, toPoint.point.geometry.coordinates]
  const segment = await getSegment(points, true)
  if (segment && segment.coordinates) clonedPatternSegments[insertionPoint] = segment.coordinates
}

/**
 * Converts an object with numerical indices to an array.
 */
const objectToArray = (obj): Array<any> => Object.keys(obj)
  .sort((a, b) => a - b)
  .reduce((acc, currentKey) => {
    if (obj[currentKey] === null) return acc
    return [...acc, obj[currentKey]]
  }, [])

/**
 * Updates the shape_dist_traveled values for each control point after a change in the pattern has occurred.
 */
const updateShapeDistTraveled = (controlPoints: Array<ControlPoint>, segments: Array<Array<number>>): void => {
  const stopCps = getStopsFromControlPoints(controlPoints)

  stopCps.forEach((cp, index) => {
    if (index === 0) controlPoints[cp.cpIndex].shapeDistTraveled = 0.0
    else {
      // previous cp.shape_dist_traveled + all segment distances between
      const previousStopCP = stopCps[index - 1]
      let newShapeDistTraveled = previousStopCP.cpIndex
      for (let i = previousStopCP.cpIndex; i < cp.cpIndex; i++) {
        const segmentDistance = lineDistance(lineString(segments[i]), 'meters')
        newShapeDistTraveled += segmentDistance
      }
      controlPoints[cp.cpIndex].shapeDistTraveled = newShapeDistTraveled
    }
  })
}

/**
 * Updates the shapes (segments and control points) after the pattern has been reordered using the pattern stop card dragging feature.
 * This method will override several of the segments around the old location of the moved stop, and around
 * the new location where the stop is being moved to.
 */
export function updateShapesAfterPatternReorder (oldPattern: Pattern, newPatternStops: Array<PatternStop>, oldPatternStopSequence: number) {
  return async function (dispatch: dispatchFn, getState: getStateFn) {
    const {controlPoints, patternSegments} = getControlPoints(getState())

    // Use object copies of the arrays to preserve indices, we'll convert back after juggling deletions
    // $FlowFixMe: Unfixable flow error probably a good indication this is a hack.
    let clonedControlPoints = Object.assign({}, clone(controlPoints))
    // $FlowFixMe
    let clonedPatternSegments = Object.assign({}, clone(patternSegments))

    const stopControlPoints = getStopsFromControlPoints(controlPoints)

    const newPatternStopSequence = newPatternStops.findIndex((pStop, index) => pStop.stopSequence === oldPatternStopSequence)

    const movedFromStart = oldPatternStopSequence === 0
    const movedFromEnd = oldPatternStopSequence === newPatternStops.length - 1
    const movedToStart = newPatternStopSequence === 0
    const movedToEnd = newPatternStopSequence === newPatternStops.length - 1

    const movedForward = oldPatternStopSequence < newPatternStopSequence

    // 1. Remove old segments and control points and backfill with new segment between stops on either side.
    //  O --X---> OLD POSITION --X--> O
    //  O --------------------------> O
    const movedStopControlPoint = stopControlPoints[oldPatternStopSequence]
    let deletedControlPoints: Array<number> = []; let deletedSegments: Array<number> = []
    let previousFromStopControlPoint, previousToStopControlPoint
    if (!movedFromEnd) { // Delete old "to" segment control points and segments, no "to" segment if we're moving from the end
      previousToStopControlPoint = stopControlPoints[oldPatternStopSequence + 1]
      const previousToSegments = previousToStopControlPoint.cpIndex - movedStopControlPoint.cpIndex; // Semi colon for babel parsing.
      [deletedControlPoints, deletedSegments] = updateControlPointsAndSegments(deletedControlPoints, deletedSegments, movedStopControlPoint.cpIndex, previousToSegments)
    }

    if (!movedFromStart) { // Delete old "from" segment control points and segments, no "from" segment if we're moving from the start
      previousFromStopControlPoint = stopControlPoints[oldPatternStopSequence - 1] // Null if moved from beginning
      const previousFromSegments = movedStopControlPoint.cpIndex - previousFromStopControlPoint.cpIndex; // Semi colon for babel parsing.
      [deletedControlPoints, deletedSegments] = updateControlPointsAndSegments(deletedControlPoints, deletedSegments, previousFromStopControlPoint.cpIndex, previousFromSegments)
    }

    // 2. At the point where we're going to insert the new stop, we need to remove a segment and insert a new one that points to the new stop
    // The segment that we remove depends on if we are moving forwards or backwards (see diagram). If we're moving forwards we need to modify the old "to" segment, if we're moving backwards the "from" segment.
    // Case: moving backward                Case: moving forward
    //  0 --x--> 0 ------> 0 -------> 0     0 -----> 0 ------> 0 ---x---> 0
    //        ↑←←←←←←←←←←←←←←←←←←←←←← 0     0 →→→→→→→→→→→→→→→→→→→↑
    // We need to initialize newToStopControlPoint to their default values if the first check fails (they are still used later if we move to start or end)
    let newFromStopControlPoint = stopControlPoints[newPatternStopSequence]; let newToStopControlPoint = stopControlPoints[newPatternStopSequence]
    if (!movedToStart && !movedToEnd) { // When you moved to the start or end, there's no previous segment to remove, only one to add.
      if (movedForward) {
        newToStopControlPoint = stopControlPoints[newPatternStopSequence + 1]
        const numberNewSegments = newToStopControlPoint.cpIndex - newFromStopControlPoint.cpIndex; // Semi colon for babel parsing.
        [deletedControlPoints, deletedSegments] = updateControlPointsAndSegments(deletedControlPoints, deletedSegments, newFromStopControlPoint.cpIndex, numberNewSegments)
      } else { // moved backward
        newFromStopControlPoint = stopControlPoints[newPatternStopSequence - 1]
        const numberNewSegments = newToStopControlPoint.cpIndex - newFromStopControlPoint.cpIndex;
        [deletedControlPoints, deletedSegments] = updateControlPointsAndSegments(deletedControlPoints, deletedSegments, newFromStopControlPoint.cpIndex, numberNewSegments)
      }
    }

    // 3. Set our cloned sets of control points and segments to null to avoid juggling array indices.
    deletedControlPoints.forEach(deletedCPIndex => { clonedControlPoints[deletedCPIndex] = null })
    deletedSegments.forEach(deletedSegmentIndex => { clonedPatternSegments[deletedSegmentIndex] = null })

    // 4. Insert our new segments as required
    // HACK: insert our new control point right after the new previous stop. The decimal ensures we insert before without rearranging all elements.
    const insertionPoint = movedToStart ? -0.1 : newFromStopControlPoint.cpIndex + 0.1
    try {
      // Insert the rearranged old segment, there is none if we moved from the start or the end
      if (!movedFromStart && !movedFromEnd && previousFromStopControlPoint) { // previousFromStopControlPoint check to make flow happy
        await generateSegmentAndInsert(clonedPatternSegments, previousFromStopControlPoint, previousToStopControlPoint, previousFromStopControlPoint.cpIndex)
      }
      // Insert the new from segment
      if (!movedToStart) {
        await generateSegmentAndInsert(clonedPatternSegments, newFromStopControlPoint, movedStopControlPoint, newFromStopControlPoint.cpIndex)
      }
      // Insert the new to segment
      if (!movedToEnd) {
        await generateSegmentAndInsert(clonedPatternSegments, movedStopControlPoint, newToStopControlPoint, insertionPoint)
      }
    } catch (err) {
      console.log(err)
      // TODO: i18n this.
      dispatch(setErrorMessage({message: `Could not rearrange stops in pattern: ${err}`}))
      return
    }

    // 5. Insert the stop into the new position and then convert to array
    clonedControlPoints[insertionPoint] = movedStopControlPoint
    clonedControlPoints[movedStopControlPoint.cpIndex] = null // delete the old copy

    // 6. Sort our control point keys in numerical order, then turn into array.
    clonedControlPoints = objectToArray(clonedControlPoints)
    clonedPatternSegments = objectToArray(clonedPatternSegments)

    // 7. Update the control points with new shape_dist_traveled values
    // TODO: there seems to be something fishy going on with the actual saving of these values --> investigate this 🔎
    // TODO: Does addPatternToStop need this for insertions??
    updateShapeDistTraveled(clonedControlPoints, clonedPatternSegments)

    // 8. Update the pattern geometry and pattern stops to reflect changes.
    dispatch(updatePatternGeometry({
      controlPoints: clonedControlPoints,
      patternSegments: clonedPatternSegments
    }))

    // Update pattern stops with cloned copy of cards (from the reorder). NOTE: stop resequencing
    // is handled by updatePatternStops.
    dispatch(updatePatternStops(oldPattern, newPatternStops))
    return dispatch(saveActiveGtfsEntity('trippattern'))
  }
}
