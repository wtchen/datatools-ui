// @flow

import { Browser } from 'leaflet'

export function defaultTileURL (mapId: ?string): string {
  const MAPBOX_MAP_ID = mapId || process.env.MAPBOX_MAP_ID
  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
  if (!MAPBOX_MAP_ID || !MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox ID and token not defined')
  }
  return `https://api.tiles.mapbox.com/v4/${MAPBOX_MAP_ID}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${MAPBOX_ACCESS_TOKEN}`
}
