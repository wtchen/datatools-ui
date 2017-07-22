import fetch from 'isomorphic-fetch'
import qs from 'qs'

export async function reversePelias (point) {
  const location = {lon: point.lng, lat: point.lat}
  const MAPZEN_TURN_BY_TURN_KEY = process.env.MAPZEN_TURN_BY_TURN_KEY
  const params = {
    api_key: MAPZEN_TURN_BY_TURN_KEY,
    ...location
  }
  const url = `https://search.mapzen.com/v1/reverse?${qs.stringify(params)}`
  const response = await fetch(url)
  const json = await response.json()
  return json
}

export async function reverseEsri (point) {
  const params = {
    location: `${point.lng},${point.lat}`,
    returnIntersection: true,
    f: 'pjson'
  }
  const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?${qs.stringify(params)}`
  const response = await fetch(url)
  const json = await response.json()
  return json
}
