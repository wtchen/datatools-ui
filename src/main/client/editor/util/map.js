
import { generateUID } from '../../common/util/util'
import { getConfigProperty } from '../../common/util/config'
import { reverseEsri as reverse } from '../../scenario-editor/utils/reverse'

export const MAP_LAYERS = [
  {
    name: 'Streets',
    id: getConfigProperty('mapbox.map_id')
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

export async function constructStop (latlng, feedSourceId) {
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
    feedId: feedSourceId,
    ...stopLatLng
  }
}

export function getFeedBounds (feedSource, pad) {
  return feedSource && feedSource.latestValidation && feedSource.latestValidation.bounds
    ? [[feedSource.latestValidation.bounds.north + pad, feedSource.latestValidation.bounds.west - pad], [feedSource.latestValidation.bounds.south - pad, feedSource.latestValidation.bounds.east + pad]]
    : [[60, 60], [-60, -20]]
}
