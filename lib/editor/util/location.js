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
