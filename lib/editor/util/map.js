// @flow

import ll from '@conveyal/lonlat'
import clone from 'lodash.clonedeep'
import fetch from 'isomorphic-fetch'
import distance from '@turf/distance'
import lineDistance from 'turf-line-distance'
import lineSlice from 'turf-line-slice'
import lineString from 'turf-linestring'
import point from 'turf-point'
import pointOnLine from 'turf-point-on-line'

import {POINT_TYPE} from '../constants'
import {getSegment} from '../../scenario-editor/utils/valhalla'
import {generateUID} from '../../common/util/util'
import {getConfigProperty} from '../../common/util/config'
import {reverseEsri as reverse} from '../../scenario-editor/utils/reverse'

import type {
  ControlPoint,
  Coordinate,
  Coordinates,
  Feed,
  GeoJsonLinestring,
  GeoJsonPoint,
  GtfsStop,
  LatLng,
  Pattern,
  PatternStop,
  ShapePoint
} from '../../types'

type MapLayer = {
  id: string,
  name: string
}

export const MAP_LAYERS: Array<MapLayer> = [
  {
    name: 'Streets',
    id: 'mapbox.streets'
  },
  {
    name: 'Light',
    id: 'mapbox.light'
  },
  {
    name: 'Dark',
    id: 'mapbox.dark'
  },
  {
    name: 'Satellite',
    id: 'mapbox.streets-satellite'
  }
]

export function clickToLatLng (
  latlng: LatLng
): {stop_lat: number, stop_lon: number} {
  const precision = 100000000 // eight decimal places is accurate up to 1.1 meters
  return {
    stop_lat: Math.round(latlng.lat * precision) / precision,
    stop_lon: Math.round((latlng.lng % 180) * precision) / precision
  }
}

/**
 * Deep clone a control point and set the distance based on an offset.
 * @param {ControlPoint} controlPoint
 * @param {Number} offsetDistance The distance to offset the original control point
 * @param {Number} offsetIndex The number to offset the shape point sequence
 * @return {ControlPoint}
 */
function cloneControlPointWithDistanceOffset (
  controlPoint: ControlPoint,
  offsetDistance?: number,
  offsetIndex: number
): ControlPoint {
  const clonedControlPoint = clone(controlPoint)
  clonedControlPoint.distance = controlPoint.distance + offsetDistance
  clonedControlPoint.shapeDistTraveled =
    controlPoint.shapeDistTraveled + offsetDistance
  clonedControlPoint.shapePtSequence =
    controlPoint.shapePtSequence + offsetIndex
  return clonedControlPoint
}

export function isValidPoint (point: any) {
  return Boolean(point && point.geometry && point.geometry.coordinates)
}

export function newControlPoint (
  distance: ?number,
  point: Coordinate,
  permanent: boolean = false,
  props: any = {}
): ControlPoint {
  if (!distance && distance !== 0) {
    throw new Error(
      'distance argument must be set when creating a new control point'
    )
  }
  return {
    distance,
    id: generateUID(),
    permanent,
    point,
    ...props
  }
}

export function isSegmentActive (activeIndex: number, index: number) {
  return activeIndex === 0
    ? index === activeIndex
    : index === activeIndex || index === activeIndex - 1
}

export function constructPoint (latlng: LatLng): GeoJsonPoint {
  const coords = ll.toCoordinates(latlng)
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords
    }
  }
}

export async function constructStop (
  latlng: LatLng,
  feedId: string
): Promise<GtfsStop> {
  const stopLatLng = clickToLatLng(latlng)
  const result = await reverse(latlng)
  const stopId = generateUID()
  let stopName = `New Stop (${stopId})`
  if (result && result.address) {
    stopName = result.address.Address
  }
  return {
    stop_id: stopId,
    stop_name: stopName,
    // feedId,
    ...stopLatLng
  }
}

/**
 * Ensure returned coordinates are valid.
 * A bug occurred in this function in a case where line-slice-along returned
 * an array with just the latlng values.
 *
 * @param  {Mixed} coords hopefully a valid array of coordinates
 * @return {Coordinate[]} a valid array of coordinates
 */
export function ensureValidCoords (coords: ?any): Array<[number, number]> {
  return coords && coords.length > 0
    ? Array.isArray(coords[0]) ? coords : [coords]
    : []
}

function geojsonFromCoordinates (
  coordinates: ?Array<[number, number]>
): ?GeoJsonLinestring {
  return (
    coordinates && {
      type: 'Feature',
      geometry: {
        coordinates: coordinates,
        type: 'LineString'
      }
    }
  )
}

export function getControlPointSnap (
  controlPointGeoJson: GeoJsonPoint,
  coordinates: Coordinates
) {
  const lineString: GeoJsonLinestring = ((geojsonFromCoordinates(
    coordinates
  ): any): GeoJsonLinestring)

  // snap control point to line
  const snapPoint = pointOnLine(lineString, controlPointGeoJson)
  const {beforeSlice, afterSlice} = getLineSlices(lineString, snapPoint)
  const index = beforeSlice.geometry.coordinates.length

  // measure line segment
  const distTraveled = lineDistance(beforeSlice, 'meters')
  return {snapPoint, distTraveled, index, beforeSlice, afterSlice}
}

export function getFeedBounds (
  feedSource: Feed,
  pad: number = 0
): [[number, number], [number, number]] {
  return feedSource &&
    feedSource.latestValidation &&
    feedSource.latestValidation.bounds &&
    !isNaN(feedSource.latestValidation.bounds.north)
    ? [
      [
        feedSource.latestValidation.bounds.north + pad,
        feedSource.latestValidation.bounds.west - pad
      ],
      [
        feedSource.latestValidation.bounds.south - pad,
        feedSource.latestValidation.bounds.east + pad
      ]
    ]
    : [[60, 60], [-60, -20]]
}

export function getPatternEndPoint (pattern: Pattern): LatLng {
  const coordinates = pattern.shape && pattern.shape.coordinates
  const patternStops = [...pattern.patternStops]
  let endPoint
  if (coordinates) {
    endPoint = ll.toLeaflet(coordinates[coordinates.length - 1])
  } else {
    if (!patternStops[0].stop_lon || !patternStops[0].stop_lat) {
      throw new Error('Pattern stop is missing coordinates')
    }
    endPoint = {lng: patternStops[0].stop_lon, lat: patternStops[0].stop_lat}
  }
  return endPoint
}

// /**
//  * Convenience function to return the coordinates from a lineSliceAlong operation
//  *
//  * @param  {Number} startDistance
//  * @param  {Number} endDistance
//  * @return {Coordinate[]}
//  */
// function lineSliceAlongToCoords (coordinates, startDistance, endDistance) {
//   if (startDistance === 0 && endDistance === 0) {
//     return []
//   }
//   return lineSliceAlong(
//     lineString(coordinates),
//     startDistance,
//     endDistance
//   ).geometry.coordinates
// }

// /**
//  * Translate meters to kilometers
//  *
//  * @param  {Number} m number of meters
//  * @return {Number}   number of kilometers
//  */
// function mToKm (m: number): number {
//   return m / 1000
// }

export async function recalculateShape ({
  controlPoints,
  defaultToStraightLine = true,
  dragId,
  editType,
  followStreets,
  index,
  newPoint,
  pattern,
  patternCoordinates,
  snapControlPointToNewSegment = false
}: {
  controlPoints: Array<ControlPoint>,
  defaultToStraightLine: boolean,
  dragId: string,
  editType: string,
  followStreets: boolean,
  index: number,
  newPoint: GeoJsonPoint,
  pattern: Pattern,
  patternCoordinates: Array<Coordinates>,
  snapControlPointToNewSegment: boolean
}) {
  const updatedPatternCoordinates = clone(patternCoordinates)
  let previousControlPoint = controlPoints[index - 1]
  let followingControlPoint = controlPoints[index + 1]
  // Initialize updated control points with copy of control points up until
  // index.
  let updatedControlPoints = controlPoints.slice(0, index)
  // Store points to make valhalla routing request.
  const pointsToRoute = []

  // Determine the segments to recalculate based on control point index
  if (editType === 'update') {
    if (index > 0) {
      // Updating something after first control point (i.e., there is a line
      // segment to handle BEFORE current control point)
      // Set previous coords to slice from beginning to previous control point
      pointsToRoute.push(previousControlPoint.point.geometry.coordinates)
    }
    pointsToRoute.push(ll.toCoordinates(newPoint))
    if (index < controlPoints.length - 1) {
      // updating something before last control point (i.e., there is a line
      // segment to handle AFTER current control point)
      pointsToRoute.push(followingControlPoint.point.geometry.coordinates)
    }
    // console.log(`index=${index} routing between control points followStreets=${followStreets}`, lineString(pointsToRoute))
  } else if (editType === 'delete') {
    // Handle removal of control point. There are two cases to handle here:
    //  1. If the control point is on the end, delete the first/last entirely.
    //  2. Otherwise, merge the previous and following segments into a single
    //     segment.
    if (index === 0) {
      // Deleting first control point.
      // Slice line at next control point
      // FIXME: fix slice index
      const sliceIndex = 1
      // Distance for following control points will decrease by the control point
      // at the slice location.
      const distanceOffset = -controlPoints[sliceIndex].distance
      // If deleting first stop, keep all control points past slice index.
      updatedControlPoints = controlPoints
        .slice(sliceIndex)
        .map(controlPoint =>
          cloneControlPointWithDistanceOffset(controlPoint, distanceOffset, -1)
        )
      // Delete first segment.
      updatedPatternCoordinates.splice(index, 1)
      return {
        coordinates: updatedPatternCoordinates,
        dragId,
        updatedControlPoints
      }
    } else if (index === controlPoints.length - 1) {
      // Deleting last control point (this should only be a stop FIXME?).
      let nextToLastIndex = controlPoints.length - 2
      if (controlPoints[index].stopId) {
        // if the control point is a stop
        // delete all other control points until the next-to-last stop
        while (!controlPoints[nextToLastIndex].stopId && nextToLastIndex > 0) {
          nextToLastIndex--
        }
      }
      // Delete last pattern segment.
      updatedPatternCoordinates.splice(-1, 1)
      return {
        coordinates: updatedPatternCoordinates,
        dragId,
        updatedControlPoints: controlPoints.slice(0, nextToLastIndex + 1)
      }
    } else {
      // If index is not 0 or the last, we are deleting an in-between control
      // point or stop. In addition to deleting the control point, we need to
      // merge the previous and following segments into a single segment.
      if (controlPoints[index].stopId) {
        // Deleting a stop.  Recalculate the shape between the previous and
        // following stops because the control points in between are now
        // irrelevant. So, in this clause we simply set the previousControlPoint
        // and followingControlPoint.
        const {previousStopIdx, followingStopIdx} = findSurroundingStopIndexes(
          index,
          controlPoints
        )
        previousControlPoint = controlPoints[previousStopIdx]
        if (followingStopIdx === -1) {
          // If index is -1, there are no more stops after this control point (i.e., the stop
          // control point being deleted was previously the last stop)!
          // Return the coordinates up to the new last stop (AKA previousStopIdx).
          const newCoords = updatedPatternCoordinates.slice(
            0,
            previousStopIdx + 1
          )
          return {
            // Set coords to null if the only stop remaining was deleted
            coordinates:
              newCoords.length > 0 ? ensureValidCoords(newCoords) : null,
            dragId,
            updatedControlPoints: controlPoints.slice(0, previousStopIdx + 1)
          }
        }
        // Set following control point to last stop index
        followingControlPoint = controlPoints[followingStopIdx]
      }
      // Route between previous and following control points.
      pointsToRoute.push(previousControlPoint.point.geometry.coordinates)
      pointsToRoute.push(followingControlPoint.point.geometry.coordinates)
    }
  } else {
    throw new Error('Invalid editType. Must be either "update" or "delete".')
  }
  // calculate new segment (valhalla or straight line)
  const newSegment = await getSegment(
    pointsToRoute,
    followStreets,
    defaultToStraightLine
  )
  if (!newSegment || !newSegment.coordinates) {
    // If new segment calculation is unsuccessful, return null for coordinates and
    // control points. The containing action should check for null values for these
    // return values to indicate failure.
    console.warn(
      `Failed to route between points for control point ${index}`,
      lineString(pointsToRoute)
    )
    return {
      coordinates: null,
      dragId,
      updatedControlPoints: null
    }
  }
  // console.log('routed segment', `http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(newSegment))}`)
  let indexOffset
  let updatedControlPoint
  if (editType === 'update') {
    // Add control point location to snap to line (if needed)
    const controlPointGeoJson = point(ll.toCoordinates(newPoint))
    const {
      snapPoint,
      distTraveled,
      index: snapIndex,
      beforeSlice,
      afterSlice
    } = getControlPointSnap(
      controlPointGeoJson,
      ensureValidCoords(newSegment.coordinates)
    )
    // Update surrounding pattern coordinate segments regardless of whether snap
    // is set to true
    if (index > 0) {
      // Only update previous segment if index is greater than zero
      updatedPatternCoordinates[index - 1] = beforeSlice.geometry.coordinates
    }
    updatedPatternCoordinates[index] = afterSlice.geometry.coordinates
    if (snapControlPointToNewSegment) {
      // Shape sequence offset for following points equals number of points in
      // new segment less the previous segment length.
      const previousSequence = previousControlPoint
        ? previousControlPoint.shapePtSequence
        : 0
      const previousDistance = previousControlPoint
        ? previousControlPoint.distance
        : 0
      const followingSequence = followingControlPoint
        ? followingControlPoint.shapePtSequence
        : controlPoints[index].shapePtSequence
      indexOffset =
        newSegment.coordinates.length - (followingSequence - previousSequence)
      // Offset snapped control point distance
      // FIXME: Any new control point must contain shape pt sequence
      updatedControlPoint = newControlPoint(
        previousDistance + distTraveled,
        snapPoint,
        true,
        {
          stopId: controlPoints[index].stopId,
          pointType: controlPoints[index].pointType,
          shapeDistTraveled: previousDistance + distTraveled,
          shapePtLat: snapPoint.geometry.coordinates[1],
          shapePtLon: snapPoint.geometry.coordinates[0],
          shapePtSequence: snapIndex + previousSequence
        }
      )
    } else {
      // FIXME: update shape pt properties
      // If not snapping to streets, simply assign new point to control point
      updatedControlPoint = Object.assign({}, controlPoints[index])
      updatedControlPoint.point = controlPointGeoJson
    }
    updatedControlPoints.push(updatedControlPoint)
  } else {
    // If deleting control point, simply replace the two surrounding segments
    // with the new segment. NOTE: splice index will be the control point index
    // less one.
    const segmentSpliceIndex = index - 1
    updatedPatternCoordinates.splice(
      segmentSpliceIndex,
      2,
      newSegment.coordinates
    )
  }
  // FIXME: handle if index is first or last
  // FIXME: handle remove

  // update positions of the rest of the control points based on distance offset
  const offset = getOffsetDistance(editType, index, newSegment, controlPoints)
  // console.log('', indexOffset, newSegment.coordinates.length)
  // For each control point after index, add cloned control point with new distance
  controlPoints
    .slice(index + 1)
    .forEach(controlPoint =>
      updatedControlPoints.push(
        cloneControlPointWithDistanceOffset(controlPoint, offset, indexOffset)
      )
    )
  // Return updated control points and updated pattern segments. NOTE: Updated
  // shape points are handled in editor data reducer, where they are assigned to
  // the active trip pattern.
  return {
    updatedControlPoints,
    dragId,
    coordinates: updatedPatternCoordinates
  }
}

export function shapePointsToSimpleCoordinates (shapePoints: Array<ShapePoint>) {
  return shapePoints
    ? shapePoints.map(shapePoint => [
      shapePoint.shapePtLon,
      shapePoint.shapePtLat
    ])
    : []
}

function findSurroundingStopIndexes (index, controlPoints) {
  let previousStopIdx = index - 1
  // Find index of previous control point that references a stop.
  while (!controlPoints[previousStopIdx].stopId && previousStopIdx > 0) {
    previousStopIdx--
  }

  let followingStopIdx = index + 1
  let nextStopFound = false
  // Find index of following control point that references a stop.
  for (; followingStopIdx < controlPoints.length; followingStopIdx++) {
    if (controlPoints[followingStopIdx].stopId) {
      nextStopFound = true
      break
    }
  }
  if (!nextStopFound) followingStopIdx = -1
  return {previousStopIdx, followingStopIdx}
}

/**
 * Iterate over pattern stops and assign shapeDistTraveled values from shape
 * points. A cloned pattern stops list is returned.
 */
export function assignDistancesToPatternStops (
  patternStops: Array<PatternStop>,
  shapePoints: Array<ShapePoint>
): any {
  const patternStopsClone = clone(patternStops)
  // Filter out only the shape points that are associated with a stop.
  const filteredShapePoints = shapePoints.filter(
    sp => sp.pointType === POINT_TYPE.STOP
  )
  for (var i = 0; i < patternStopsClone.length; i++) {
    const shapeDistTraveled = filteredShapePoints[i]
      ? filteredShapePoints[i].shapeDistTraveled
      : null
    patternStopsClone[i].shapeDistTraveled = shapeDistTraveled
  }
  return patternStopsClone
}

/**
 * Constructs shape points from a pattern's control points and multi-line pattern
 * segments.
 */
export function constructShapePoints (
  controlPoints: Array<ControlPoint>,
  patternSegments: Array<any>
): any {
  const shapePoints = []
  // FIXME: make sure number of segments and control points are appropriately
  // configured. For example:
  // there should always be capping control points
  // *-------*-------*------*-----*
  for (var i = 0; i < controlPoints.length; i++) {
    const controlPoint = controlPoints[i]
    const {point, pointType} = controlPoint
    const lastDistance = shapePoints.length
      ? shapePoints[shapePoints.length - 1].shapeDistTraveled
      : 0
    shapePoints.push({
      shapePtLat: point.geometry.coordinates[1],
      shapePtLon: point.geometry.coordinates[0],
      shapeDistTraveled: lastDistance,
      pointType
    })
    const segment = patternSegments[i]
    if (segment) {
      // Add segment to list of shape points (last iteration should have no segment
      // because the geometry should be capped with an extra control point).

      // FIXME: this may not work for large arrays (100,000 or more)
      shapePoints.push(
        ...coordinatesToShapePoints(segment, lastDistance, shapePoints.length)
      )
    }
  }
  const resquencedShapePoints = shapePoints.map(resequenceShapePoints)
  // console.log('updated shapepoints', resquencedShapePoints)
  return resquencedShapePoints
}

function resequenceShapePoints (shapePoint, index) {
  return {
    ...shapePoint,
    shapePtSequence: index
  }
}

function coordinatesToShapePoints (
  coordinates,
  initialDistance = 0,
  initialSequence = 0
) {
  let previousPoint
  let cumulativeDistance = initialDistance
  return coordinates.map((coordinate, index) => {
    const currPoint = point(coordinate)
    const distanceFromPrevious = previousPoint
      ? distance(previousPoint, currPoint, {units: 'meters'})
      : 0
    previousPoint = currPoint
    cumulativeDistance += distanceFromPrevious
    return {
      shapePtLat: coordinate[1],
      shapePtLon: coordinate[0],
      shapePtSequence: initialSequence + index + 1, // ensure sequence is offset from initial
      shapeDistTraveled: cumulativeDistance,
      pointType: 0
    }
  })
}

export function getLineSlices (
  lineSegment: GeoJsonLinestring,
  pointOnLine: GeoJsonPoint
) {
  const coords = lineSegment.geometry.coordinates
  const beginPoint = point(coords[0])
  const endPoint = point(coords[coords.length - 1])
  const beforeSlice = lineSlice(beginPoint, pointOnLine, lineSegment)
  const afterSlice = lineSlice(pointOnLine, endPoint, lineSegment)
  return {afterSlice, beforeSlice}
}

function getOffsetDistance (
  editType: string,
  index: number,
  newSegment: {
    type: 'LineString',
    coordinates: Coordinates
  },
  controlPoints: Array<ControlPoint>
) {
  let offsetDistance
  const previousControlPoint = controlPoints[index - 1]
  const followingControlPoint = controlPoints[index + 1]
  // Use distance of new segment to calculate offset
  const segmentDistance = lineDistance(
    geojsonFromCoordinates(ensureValidCoords(newSegment.coordinates)),
    'meters'
  )
  if (editType === 'update' && index === 0) {
    offsetDistance = segmentDistance - followingControlPoint.distance
  } else if (editType === 'update' && index === controlPoints.length - 1) {
    // do nothing to avoid undefined error on followingControlPoint
    // following array slice method will not error because array is empty
  } else {
    offsetDistance =
      segmentDistance -
      (followingControlPoint.distance - previousControlPoint.distance)
  }
  return offsetDistance
}

// function getUpdatedControlPoint (controlPoints, newPoint, newSegment, previousControlPoint, index, snapControlPointToNewSegment) {
//   const controlPointGeoJson = point(ll.toCoordinates(newPoint))
//   let updatedControlPoint
//   if (snapControlPointToNewSegment) {
//     const {snapPoint, distTraveled, index: snapIndex} = getControlPointSnap(
//       controlPointGeoJson,
//       ensureValidCoords(newSegment.coordinates)
//     )
//     // Offset snapped control point distance
//     // FIXME: Any new control point must contain shape pt sequence
//     updatedControlPoint = newControlPoint(
//       previousControlPoint.distance + distTraveled,
//       snapPoint,
//       true,
//       {
//         shapeDistTraveled: previousControlPoint.distance + distTraveled,
//         shapePtLat: snapPoint.geometry.coordinates[1],
//         shapePtLon: snapPoint.geometry.coordinates[0],
//         shapePtSequence: snapIndex + previousControlPoint.shapePtSequence
//       }
//     )
//   } else {
//     // FIXME: update shape pt properties
//     updatedControlPoint = Object.assign({}, controlPoints[index])
//     updatedControlPoint.point = controlPointGeoJson
//   }
//   return updatedControlPoint
// }

export function controlPointToShapePoint (controlPoint: any) {
  return {
    shapePtLat: controlPoint.point.geometry.coordinates[1],
    shapePtLon: controlPoint.point.geometry.coordinates[0],
    pointType: controlPoint.stopId ? 1 : 2,
    // FIXME: distance column not populated automatically in backend.
    shapeDistTraveled: controlPoint.distance,
    // Assign sequence value if available
    shapePtSequence: controlPoint.shapePtSequence
  }
}

export async function route (from: LatLng, to: LatLng): Promise<any> {
  const r5url: ?string = getConfigProperty('application.r5')
  if (!r5url) {
    throw new Error('r5 url not set')
  }
  const url = `${r5url}/plan?fromLat=${from.lat}&fromLon=${from.lng}&toLat=${to.lat}&toLon=${to.lng}&mode=CAR&full=false`
  const response = await fetch(url)
  const json = await response.json()
  return json
}

/**
 * Creates an empty pattern stop object for a given stop. Default stop sequence
 * value is 0.
 */
export function stopToPatternStop (
  stop: GtfsStop,
  stopSequence: number = 0
): PatternStop {
  if (!stop.stop_id) {
    throw new Error('Stop Id not set')
  }
  return {
    id: generateUID(),
    stopSequence,
    stopId: stop.stop_id,
    defaultDwellTime: 0,
    defaultTravelTime: 0,
    dropOffType: 0,
    pickupType: 0,
    shapeDistTraveled: null,
    timepoint: null
  }
}

export async function street (from: LatLng, to: LatLng): Promise<any | null> {
  let json
  try {
    json = await route(from, to)
  } catch (e) {
    return null
  }
  if (json.errors) {
    console.log('error getting r5 data', json)
    return null
  } else {
    return json
  }
}
