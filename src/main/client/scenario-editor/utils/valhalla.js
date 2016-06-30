import fetch from 'isomorphic-fetch'
import {decode as decodePolyline} from 'polyline'

export async function route (start, end) {
  const MAPZEN_TURN_BY_TURN_KEY = DT_CONFIG['MAPZEN_TURN_BY_TURN_KEY']
  const json = {
    costing: 'bus',
    locations: [
      {lon: start.lng, lat: start.lat},
      {lon: end.lng, lat: end.lat}
    ]
  }
  const response = await fetch(`https://valhalla.mapzen.com/route?json=${JSON.stringify(json)}&api_key=${MAPZEN_TURN_BY_TURN_KEY}`)
  return await response.json()
}

export async function polyline (start, end) {
  const json = await route(start, end)
  const maneuvers = json.trip.legs[0].maneuvers
  let ignorePoints = {}
  for (var i = 0; i < maneuvers.length; i++) {
    if (maneuvers[i].type === 5 || maneuvers[i].type === 6) {
      ignorePoints.from = maneuvers[i].begin_shape_index
      ignorePoints.to = maneuvers[i].end_shape_index
    }
  }
  return decodePolyline(json.trip.legs[0].shape)
    .filter((c, index) => !(index === ignorePoints.from || index === ignorePoints.to)) // filter out points used for destination on right/left
    .map((c, index) => [c[1] / 10, c[0] / 10]) // Mapzen or Mapbox is encoding/decoding wrong?
}
