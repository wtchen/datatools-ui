// @flow
import type { LocationShape } from '../../types'

export function unflattenLocation (locations) {
  // Reduce data from flattened back end file to array for front end use
  // Also add a flag for each that indicates this data is coming from the store
  // (lets LocationsLayer render EditControl layers separately)
  const formattedLocations = locations.map(location => {
    const {location_shapes: locationShapes} = location
    if (locationShapes && locationShapes.length > 0) {
      const formattedLocationShapes = locationShapes.reduce((acc, cur) => {
        const {
          geometry_id: id,
          geometry_pt_lat: lat,
          geometry_pt_lon: lon,
          geometry_type: type
        } = cur
        return {
          ...acc,
          [id]: {
            'geometry_id': id,
            'fromSaved': false, // This fromSaved property is only set on the locationLayer unmount, to avoid duplication w/ EditControl
            'geometry_type': type,
            'geometry_coords': acc[id] ? [...(acc[id].geometry_coords), [lat, lon]] : [[lat, lon]]
          }
        }
      }, {})
      location.location_shapes = Object.values(formattedLocationShapes)
      return location
    }
  })
  return formattedLocations[0] ? formattedLocations : null
}

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

export const convertLatLngToArray = latlng => [latlng.lat, latlng.lng]
