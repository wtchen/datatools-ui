import fetch from 'isomorphic-fetch'
import qs from 'qs'

import { getConfigProperty } from '../../common/util/config'

export async function reversePelias (point) {
  const location = {lon: point.lng, lat: point.lat}
  const api_key = getConfigProperty('MAPZEN_TURN_BY_TURN_KEY')
  const params = {
    api_key,
    ...location
  }
  // api_key=mapzen-xxxxxx&point.lat=48.858268&point.lon=2.294471
  const url = `https://search.mapzen.com/v1/reverse?${qs.stringify(params)}`
  const response = await fetch(url)
  return await response.json()
}

export async function reverseEsri (point) {
  const params = {
    location: `${point.lng},${point.lat}`,
    returnIntersection: true,
    f: 'pjson'
  }
  const url = `http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?${qs.stringify(params)}`
  const response = await fetch(url)
  return await response.json()
}
