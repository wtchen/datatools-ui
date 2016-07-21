import fetch from 'isomorphic-fetch'
import {decode as decodePolyline} from 'polyline'
import ll, {isEqual as coordinatesAreEqual} from 'lonlng'

export async function route (points) {
  if (points.length < 2) {
    return null
  }
  const MAPZEN_TURN_BY_TURN_KEY = DT_CONFIG['MAPZEN_TURN_BY_TURN_KEY']
  const locations = points.map(p => (
    {lon: p.lng, lat: p.lat}
  ))
  const json = {
    costing: 'bus',
    locations
  }
  const response = await fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(json)}&api_key=${MAPZEN_TURN_BY_TURN_KEY}`)
  return await response.json()
}

export async function polyline (points) {
  let json
  try {
    json = await route(points)
  } catch (e) {
    return null
  }
  if (json) {
    const legArray = json.trip.legs.map((leg, index) => {
      let ignorePoints = {}
      for (var i = 0; i < leg.maneuvers.length; i++) {
        if (leg.maneuvers[i].type === 5 || leg.maneuvers[i].type === 6) {
          ignorePoints.from = leg.maneuvers[i].begin_shape_index
          ignorePoints.to = leg.maneuvers[i].end_shape_index
        }
      }
      return decodePolyline(leg.shape)
        .filter((c, index) => !(index === ignorePoints.from || index === ignorePoints.to)) // filter out points used for destination on right/left
        .map((c, index) => [c[1] / 10, c[0] / 10]) // Mapzen or Mapbox is encoding/decoding wrong?
    })
    return [].concat.apply([], legArray)
  }
  else {
    return null
  }
}

export async function getSegment (points, followRoad) {
  let geometry
  if (followRoad) { // if followRoad
      const coordinates = await polyline(points.map(p => ({lng: p[0], lat: p[1]}))) // [{lng: from[0], lat: from[1]}, {lng: to[0], lat: to[1]}])
      if (!coordinates) {
        geometry = await lineString(points).geometry
      }
      else {
        const c0 = coordinates[0]
        const cy = coordinates[coordinates.length - 1]
        const epsilon = 1e-6
        if (!coordinatesAreEqual(c0, points[0], epsilon)) {
          coordinates.unshift(points[0])
        }
        // if (!coordinatesAreEqual(cy, to, epsilon)) {
        //   coordinates.push(to)
        // }

        geometry = {
          type: 'LineString',
          coordinates
        }
      }
    } else {
      geometry = await lineString(points).geometry
    }
    return geometry
}
