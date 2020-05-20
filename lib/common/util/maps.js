// @flow

import { Browser } from 'leaflet'

/**
 * Get the default Mapbox tile URL used for use in a leaflet map. Optionally
 * takes a map ID (e.g., mapbox/outdoors-v11).
 */
export function defaultTileURL (mapId: ?string): string {
  // If no mapId is provided, default to id defined in env.yml or, ultimately,
  // fall back on default value.
  const id = mapId || process.env.MAPBOX_MAP_ID || 'mapbox/outdoors-v11'
  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox token not defined')
  }
  return `https://api.mapbox.com/styles/v1/${id}/tiles/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}?access_token=${MAPBOX_ACCESS_TOKEN}`
}
