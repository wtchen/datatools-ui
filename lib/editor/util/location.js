// @flow
import type { LatLng } from 'leaflet'

import type { LocationShape } from '../../types'

export const groupLocationShapePoints = (locationShapes: LocationShape) => {
  return locationShapes.reduce(
    (acc, cur) => {
      const coordinates = [cur.geometry_pt_lat, cur.geometry_pt_lon]

      if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [coordinates]
      else acc[cur.geometry_id].push(coordinates)
      return acc
    },
    {}
  )
}

export const convertLatLngToArray = (latlng: LatLng) => [latlng.lat, latlng.lng]
