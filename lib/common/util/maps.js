// @flow

import { Browser } from 'leaflet'

export function defaultTileURL (mapId: ?string): string {
  const MAP_URL = process.env.MAP_URL
  const MAP_ID = mapId || process.env.MAP_ID
  const MAP_KEY = process.env.MAP_KEY
  if (!MAP_ID || !MAP_KEY || !MAP_URL) {
    throw new Error('Map URL, ID, or token not defined')
  }
  return `//${MAP_URL}/${MAP_ID}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?${MAP_KEY}`
}
