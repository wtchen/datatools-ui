import ll from '@conveyal/lonlat'
import fetch from 'isomorphic-fetch'
import lineDistance from 'turf-line-distance'
import lineSlice from 'turf-line-slice'
import lineSliceAlong from '@turf/line-slice-along'
import lineString from 'turf-linestring'
import point from 'turf-point'
import pointOnLine from 'turf-point-on-line'

import {getSegment} from '../../scenario-editor/utils/valhalla'
import {generateUID} from '../../common/util/util'
import {getConfigProperty} from '../../common/util/config'
import {reverseEsri as reverse} from '../../scenario-editor/utils/reverse'

export const MAP_LAYERS = [
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

export function stopToStopTime (stop) {
  return {stopId: stop.id, defaultDwellTime: 0, defaultTravelTime: 0}
}

export function clickToLatLng (latlng) {
  const precision = 100000000 // eight decimal places is accurate up to 1.1 meters
  return {stop_lat: Math.round(latlng.lat * precision) / precision, stop_lon: Math.round(latlng.lng % 180 * precision) / precision}
}

export function newControlPoint (distance, point, permanent = false, props = {}) {
  return {
    distance,
    id: generateUID(),
    permanent,
    point,
    ...props
  }
}

export async function constructStop (latlng, feedId) {
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
    feedId,
    ...stopLatLng
  }
}

export function constructPoint (latlng) {
  const coords = ll.toCoordinates(latlng)
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords
    }
  }
}

export async function route (from, to) {
  const url = `${getConfigProperty('application.r5')}/plan?fromLat=${from.lat}&fromLon=${from.lng}&toLat=${to.lat}&toLon=${to.lng}&mode=CAR&full=false`
  const response = await fetch(url)
  return await response.json()
}

export async function street (from, to) {
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

export function getPatternEndPoint (pattern) {
  const coordinates = pattern.shape && pattern.shape.coordinates
  const patternStops = [...pattern.patternStops]
  let endPoint
  if (coordinates) {
    endPoint = ll.toLeaflet(coordinates[coordinates.length - 1])
  } else {
    endPoint = {lng: patternStops[0].stop_lon, lat: patternStops[0].stop_lat}
  }
  return endPoint
}

export function getFeedBounds (feedSource, pad = 0) {
  return feedSource && feedSource.latestValidation && feedSource.latestValidation.bounds
    ? [[feedSource.latestValidation.bounds.north + pad, feedSource.latestValidation.bounds.west - pad], [feedSource.latestValidation.bounds.south - pad, feedSource.latestValidation.bounds.east + pad]]
    : [[60, 60], [-60, -20]]
}

/**
 * Recalculate the shape coordinates of a pattern after an edit
 *
 * @param  {ControlPoint[]}  controlPoints
 * @param  {String}  editType either 'insert, delete, or update'
 * @param  {Number}  index  The control point index.
 *   For insert, the point will be inserted at this position
 *   For delete, this point is removed and coordinates are recalculated between the remaining points
 *   For update, the coordinates are recalculated using the adjacent control points
 * @param  {Boolean}  followStreets
 * @param  {Boolean}  newPoint  Must be sent for insert operations
 * @param  {Boolean} [defaultToStraightLine=true]
 * @return {Coordinate[]} The resulting coordinates of the linestring of the updated pattern shape
 */
export async function recalculatePatternCoordinates (
  controlPoints,
  editType,
  index,
  followStreets,
  newPoint,
  patternShape,
  defaultToStraightLine = true
) {
  // validate arguments
  if (['insert', 'update'].indexOf(editType) > -1 && !newPoint) {
    throw new Error('newPoint argument is required when editType is "insert" or "update"')
  }

  /**
   * Convenience function to return the coordinates from a lineSliceAlong operation
   *
   * @param  {Number} startDistance
   * @param  {Number} endDistance
   * @return {Coordinate[]}
   */
  function lineSliceAlongToCoords (startDistance, endDistance) {
    return lineSliceAlong(
      lineString(patternShape.coordinates),
      startDistance,
      endDistance
    ).geometry.coordinates
  }

  const previousControlPoint = controlPoints[index - 1]
  const currentControlPoint = controlPoints[index]
  const followingControlPoint = controlPoints[index + 1]
  const lastControlPointDistance = mToKm(
    controlPoints[controlPoints.length - 1].distance
  )

  const newPointCoordinates = newPoint ? ll.toCoordinates(newPoint) : null

  const originalCoords = patternShape.coordinates
  let previousCoords = []
  let followingCoords = []

  // create points to make valhalla routing request
  // also store previous and remaining coords to make new resulting coordinate array
  let points

  if (editType === 'insert') {
    if (index === 0) {
      // inserting a point before first controlPoint
      points = [
        newPointCoordinates,
        currentControlPoint.point.geometry.coordinates
      ]
      followingCoords = originalCoords
    } else if (index === controlPoints.length) {
      // inserting a point at end of controlPoints
      points = [
        previousControlPoint.point.geometry.coordinates,
        newPointCoordinates
      ]
      previousCoords = originalCoords
    } else {
      // inserting a point between other control points
      points = [
        previousControlPoint.point.geometry.coordinates,
        newPointCoordinates,
        currentControlPoint.point.geometry.coordinates
      ]
      previousCoords = lineSliceAlongToCoords(
        0,
        mToKm(previousControlPoint.distance)
      )
      followingCoords = lineSliceAlongToCoords(
        mToKm(currentControlPoint.distance),
        lastControlPointDistance
      )
    }
  } else if (editType === 'update') {
    points = []
    if (index > 0) {
      points.push(previousControlPoint.point.geometry.coordinates)
      previousCoords = lineSliceAlongToCoords(
        0,
        mToKm(previousControlPoint.distance)
      )
    }
    points.push(newPointCoordinates)
    if (index < controlPoints.length - 1) {
      points.push(followingControlPoint.point.geometry.coordinates)
      followingCoords = lineSliceAlongToCoords(
        mToKm(followingControlPoint.distance),
        lastControlPointDistance
      )
    }
  } else if (editType === 'delete') {
    if (index === 0) {
      // deleting first stop.  Return coordinates of remaining stops
      return lineSliceAlongToCoords(
        mToKm(controlPoints[2].distance),
        lastControlPointDistance
      )
    } else if (index === controlPoints.length - 1) {
      // deleting last stop.  Return coordinates of all preceeding stops
      return lineSliceAlongToCoords(
        0,
        mToKm(controlPoints[controlPoints.length - 3].distance)
      )
    } else {
      // deleting an in-between control point
      points = [
        previousControlPoint.point.geometry.coordinates,
        followingControlPoint.point.geometry.coordinates
      ]
      previousCoords = lineSliceAlongToCoords(
        0,
        mToKm(previousControlPoint.distance)
      )
      followingCoords = lineSliceAlongToCoords(
        mToKm(followingControlPoint.distance),
        lastControlPointDistance
      )
    }
  }

  // calculate new segment
  const newSegment = await getSegment(
    points,
    followStreets,
    defaultToStraightLine
  )

  // rebuild linestring
  return [...previousCoords, ...newSegment.coordinates, ...followingCoords]
}

function geojsonFromCoordinates (coordinates) {
  return coordinates && {
    type: 'Feature',
    geometry: {
      coordinates: coordinates,
      type: 'LineString'
    }
  }
}

export function getControlPointSnap (controlPointGeoJson, coordinates) {
  const geojson = geojsonFromCoordinates(coordinates)

  // snap control point to line
  const snap = pointOnLine(geojson, controlPointGeoJson)
  const lineSegment = lineSlice(point(geojson.geometry.coordinates[0]), snap, geojson)

  // measure line segment
  const distTraveled = lineDistance(lineSegment, 'meters')
  return { snap, distTraveled }
}

/**
 * Translate meters to kilometers
 *
 * @param  {Number} m number of meters
 * @return {Number}   number of kilometers
 */
function mToKm (m) {
  return m / 1000
}
