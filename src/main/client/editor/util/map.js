import lineString from 'turf-linestring'
import fetch from 'isomorphic-fetch'
import ll from 'lonlng'
import lineDistance from 'turf-line-distance'
import pointOnLine from 'turf-point-on-line'
import lineSlice from 'turf-line-slice'
import point from 'turf-point'

import {getSegment} from '../../scenario-editor/utils/valhalla'
import { generateUID } from '../../common/util/util'
import { getConfigProperty } from '../../common/util/config'
import { reverseEsri as reverse } from '../../scenario-editor/utils/reverse'

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

// TODO: not used currently, remove?
export function zoomToEntity (entity, map) {
  if (entity && entity.id) {
    map.leafletElement.panTo([entity.stop_lat, entity.stop_lon])
  }
}

export async function constructStop (latlng, feedId) {
  let stopLatLng = clickToLatLng(latlng)
  let result = await reverse(latlng)
  let stopId = generateUID()
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
  let coordinates = pattern.shape && pattern.shape.coordinates
  let patternStops = [...pattern.patternStops]
  let endPoint
  if (coordinates) {
    endPoint = ll.toLatlng(coordinates[coordinates.length - 1])
  } else {
    endPoint = {lng: patternStops[0].stop_lon, lat: patternStops[0].stop_lat}
  }
  return endPoint
}

export function getFeedBounds (feedSource, pad) {
  return feedSource && feedSource.latestValidation && feedSource.latestValidation.bounds
    ? [[feedSource.latestValidation.bounds.north + pad, feedSource.latestValidation.bounds.west - pad], [feedSource.latestValidation.bounds.south - pad, feedSource.latestValidation.bounds.east + pad]]
    : [[60, 60], [-60, -20]]
}

export async function handlePatternEdit (position, begin, end, pattern, followStreets, patternCoordinates) {
  let originalLatLngs
  let originalEndPoint
  let from, to

  // set from, to for endPoint if we have position
  if (begin && position) {
    from = begin
    to = [position.lng, position.lat]
  } else if (begin) { // set just from (when controlPoint is removed)
    from = begin
  } else if (end) { // set from for beginPoint
    from = [position.lng, position.lat]
  } else { // otherwise use the original endpoint
    originalLatLngs = pattern.shape.coordinates.map(c => ([c[1], c[0]]))
    originalEndPoint = originalLatLngs[originalLatLngs.length - 1]
    from = [originalEndPoint[1], originalEndPoint[0]] // [patternCoordinates[patternCoordinates.length - 1].lng, patternCoordinates[patternCoordinates.length - 1].lat]
    to = [position.lng, position.lat]
  }

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
    let newSegment = await getSegment(points, followStreets)
    let originalSegment = lineString(patternCoordinates)

    // slice line if middle control point
    if (end && begin) {
      let beginPoint = point(patternCoordinates[0])
      let beginSlice = lineSlice(beginPoint, from, originalSegment)
      let endPoint = point(patternCoordinates[patternCoordinates.length - 1])
      let endSlice = lineSlice(end, endPoint, originalSegment)
      newCoordinates = [
        ...beginSlice.geometry.coordinates,
        ...newSegment.coordinates,
        ...endSlice.geometry.coordinates
      ]
    } else if (end) { // handle begin control point
      let endPoint = point(patternCoordinates[patternCoordinates.length - 1])
      let endSlice = lineSlice(end, endPoint, originalSegment)
      newCoordinates = [
        ...newSegment.coordinates,
        ...endSlice.geometry.coordinates
      ]
    } else { // append latlngs if end control point
      let beginPoint = point(patternCoordinates[0])
      let beginSlice = lineSlice(beginPoint, from, originalSegment)
      newCoordinates = [
        ...beginSlice.geometry.coordinates,
        ...newSegment.coordinates
      ]
    }
    return newCoordinates
  }
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

export function handleControlPointDragEnd (e, coordinates) {
  let geojson = geojsonFromCoordinates(coordinates)

  // snap control point to line
  let controlPointLocation = e.target.toGeoJSON()
  let snap = pointOnLine(geojson, controlPointLocation)
  let lineSegment = lineSlice(point(geojson.geometry.coordinates[0]), snap, geojson)

  // measure line segment
  let distTraveled = lineDistance(lineSegment, 'meters')
  return { snap, distTraveled }
}
