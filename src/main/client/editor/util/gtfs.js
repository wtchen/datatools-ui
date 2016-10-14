import along from 'turf-along'
import lineDistance from 'turf-line-distance'
import { latLngBounds } from 'leaflet'

export const componentList = ['route', 'stop', 'fare', 'feedinfo', 'calendar', 'scheduleexception', 'agency']
export const subComponentList = ['trippattern']
export const subSubComponentList = ['timetable']

export const isNew = (entity) => {
  return entity.id === 'new' || typeof entity.id === 'undefined'
}

export const getEntityBounds = (entity, offset = 0.005) => {
  if (!entity) return null

  // [lng, lat]
  if (entity.constructor === Array) {
    return latLngBounds([[entity[1] + offset, entity[0] - offset], [entity[1] - offset, entity[0] + offset]])
  }
  // stop
  else if (typeof entity.stop_lat !== 'undefined') {
    return latLngBounds([[entity.stop_lat + offset, entity.stop_lon - offset], [entity.stop_lat - offset, entity.stop_lon + offset]])
  }
  // route
  else if (typeof entity.tripPatterns !== 'undefined') {
    let coordinates = []
    entity.tripPatterns.map(pattern => {
      if (pattern.shape && pattern.shape.coordinates) {
        coordinates = [
          ...coordinates,
          ...pattern.shape.coordinates.map(c => ([c[1], c[0]]))
        ]
      }
    })
    return latLngBounds(coordinates)
  }
  // trip pattern
  else if (typeof entity.shape !== 'undefined') {
    return latLngBounds(entity.shape.coordinates.map(c => ([c[1], c[0]])))
  }
}

export const getEntityName = (component, entity) => {
  if (!entity) {
    return '[Unnamed]'
  }
  let nameKey =
      'route_id' in entity
    ? 'route_short_name'
    : 'agency_name' in entity
    ? 'agency_name'
    : 'stop_id' in entity
    ? 'stop_name'
    : 'service_id' in entity
    ? 'description'
    : 'fare_id' in entity
    ? 'fare_id'
    : 'exemplar' in entity // schedule exception
    ? 'name'
    : null
  // if (nameKey !== 'stop_name') console.log(nameKey)
  switch (nameKey) {
    case 'stop_name':
      return entity.stop_name && entity.stop_code
        ? `${entity.stop_name} (${entity.stop_code})`
        : entity.stop_name && entity.stop_id
        ? `${entity.stop_name} (${entity.stop_id})`
        : entity.stop_name || '[no name]'
    case 'route_short_name':
      return entity.route_short_name && entity.route_long_name && entity.route_short_name !== '""' && entity.route_long_name !== '""'
        ? `${entity.route_short_name} - ${entity.route_long_name}`
        : entity.route_short_name && entity.route_short_name !== '""'
        ? entity.route_short_name
        : entity.route_long_name && entity.route_long_name !== '""'
        ? entity.route_long_name
        : entity.route_id || '[no name]'
    default:
      return entity[nameKey] || '[no name]'
  }
}

export const gtfsIcons = [
  {
    id: 'feedinfo',
    icon: 'info',
    addable: false,
    title: 'Edit feed info',
    label: 'Feed Info'
  },
  {
    id: 'agency',
    icon: 'building',
    addable: true,
    title: 'Edit agencies',
    label: 'Agencies'
  },
  {
    id: 'route',
    icon: 'bus',
    addable: true,
    title: 'Edit routes',
    label: 'Routes'
  },
  {
    id: 'stop',
    icon: 'map-marker',
    addable: true,
    title: 'Edit stops',
    label: 'Stops'
  },
  {
    id: 'calendar',
    icon: 'calendar',
    addable: true,
    title: 'Edit calendars',
    label: 'Calendars'
  },
  {
    id: 'scheduleexception',
    icon: 'ban',
    addable: true,
    hideSidebar: true,
    title: 'Edit schedule exceptions'
  },
  {
    id: 'fare',
    icon: 'ticket',
    addable: true,
    title: 'Edit fares',
    label: 'Fares'
  }
]

export const getControlPoints = (pattern, snapToStops) => {
  if (!pattern) {
    return []
  }
  let controlPoints = []
  pattern.shape && pattern.patternStops && pattern.patternStops.map((ps, index) => {
    // set distance to average of patternStop and next patternStop, if last stop set to end of segment
    let distance = pattern.patternStops[index + 1]
      ? (pattern.patternStops[index + 1].shapeDistTraveled + ps.shapeDistTraveled) / 2
      : lineDistance(pattern.shape, 'meters')
    let point = pattern.shape && along(pattern.shape, distance, 'meters')
    let controlPoint = {
      point,
      distance: distance,
      permanent: true
    }
    let stopPoint = pattern.shape && along(pattern.shape, ps.shapeDistTraveled, 'meters')
    let stopControl = {
      point: stopPoint,
      permanent: true,
      distance: ps.shapeDistTraveled,
      ...ps
    }
    if (snapToStops) {
      stopControl.hidden = true
    }
    controlPoints.push(stopControl)
    controlPoints.push(controlPoint)
  })
  return controlPoints
}

export function getRouteName (route) {
  let name = ''
  if(route.route_short_name) {
    name += route.route_short_name
    if(route.route_long_name) {
      name += ' - '
    }
  }

  if(route.route_long_name) {
    name += route.route_long_name
  }

  return name
}

export const stopToGtfs = (s) => {
  return {
    // datatools props
    id: s.id,
    feedId: s.feedId,
    bikeParking: s.bikeParking,
    carParking: s.carParking,
    pickupType: s.pickupType,
    dropOffType: s.dropOffType,

    // gtfs spec props
    stop_code: s.stopCode,
    stop_name: s.stopName,
    stop_desc: s.stopDesc,
    stop_lat: s.lat,
    stop_lon: s.lon,
    zone_id: s.zoneId,
    stop_url: s.stopUrl,
    location_type: s.locationType,
    parent_station: s.parentStation,
    stop_timezone: s.stopTimezone,
    wheelchair_boarding: s.wheelchairBoarding,
    stop_id: s.gtfsStopId
  }
}

export const stopFromGtfs = (stop) => {
  return {
    gtfsStopId: stop.stop_id,
    stopCode: stop.stop_code,
    stopName: stop.stop_name,
    stopDesc: stop.stop_desc,
    lat: stop.stop_lat,
    lon: stop.stop_lon,
    zoneId: stop.zone_id,
    stopUrl: stop.stop_url,
    locationType: stop.location_type,
    parentStation: stop.parent_station,
    stopTimezone: stop.stop_timezone,
    wheelchairBoarding: stop.wheelchair_boarding,
    bikeParking: stop.bikeParking,
    carParking: stop.carParking,
    pickupType: stop.pickupType,
    dropOffType: stop.dropOffType,
    feedId: stop.feedId,
    id: isNew(stop) ? null : stop.id,
  }
}

export const agencyToGtfs = ent => {
  return {
    // datatools props
    id: ent.id,
    feedId: ent.feedId,
    agencyBrandingUrl: ent.agencyBrandingUrl,

    // gtfs spec props
    agency_id: ent.agencyId,
    agency_name: ent.name,
    agency_url: ent.url,
    agency_timezone: ent.timezone,
    agency_lang: ent.lang,
    agency_phone: ent.phone,
    agency_fare_url: ent.agencyFareUrl,
    agency_email: ent.email
  }
}

export const gtfsSort = (a, b) => {
  const radix = 10
  var aName = getEntityName(null, a)
  var bName = getEntityName(null, b)
  if (a.isCreating && !b.isCreating) return -1
  if (!a.isCreating && b.isCreating) return 1
  if (!isNaN(parseInt(aName, radix)) && !isNaN(parseInt(bName, radix)) && !isNaN(+aName) && !isNaN(+bName)) {
    if (parseInt(aName, radix) < parseInt(bName, radix)) return -1
    if (parseInt(aName, radix) > parseInt(bName, radix)) return 1
    return 0
  }
  if (aName.toLowerCase() < bName.toLowerCase()) return -1
  if (aName.toLowerCase() > bName.toLowerCase()) return 1
  return 0
}
