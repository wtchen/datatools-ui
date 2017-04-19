import along from 'turf-along'
import lineDistance from 'turf-line-distance'
import { latLngBounds } from 'leaflet'

import {newControlPoint} from './map'

export const componentList = ['route', 'stop', 'fare', 'feedinfo', 'calendar', 'scheduleexception', 'agency']
export const subComponentList = ['trippattern']
export const subSubComponentList = ['timetable']

export function isNew (entity) {
  return entity.id === 'new' || typeof entity.id === 'undefined'
}

export function getEntityBounds (entity, offset = 0.005) {
  if (!entity) return null

  // [lng, lat]
  if (entity.constructor === Array) {
    return latLngBounds([[entity[1] + offset, entity[0] - offset], [entity[1] - offset, entity[0] + offset]])
  } else if (typeof entity.stop_lat !== 'undefined') {
    // stop
    return latLngBounds([[entity.stop_lat + offset, entity.stop_lon - offset], [entity.stop_lat - offset, entity.stop_lon + offset]])
  } else if (typeof entity.tripPatterns !== 'undefined') {
    // route
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
  } else if (entity.shape) {
    // trip pattern
    return latLngBounds(entity.shape.coordinates.map(c => ([c[1], c[0]])))
  } else if (entity.patternStops) {
    // TODO: add pattern stops bounds extraction
    return null
  }
}

export function findEntityByGtfsId (component, gtfsId, entities) {
  let entity
  switch (component) {
    case 'stop':
      entity = entities.find(e => e.gtfsStopId === gtfsId)
      break
    case 'route':
      entity = entities.find(e => e.gtfsRouteId === gtfsId)
      break
    case 'calendar':
      entity = entities.find(e => e.gtfsServiceId === gtfsId)
      break
    default:
      entity = null
      break
  }
  return entity ? entity.id : -1
}

export function getEntityName (component, entity) {
  if (!entity) {
    return '[Unnamed]'
  }
  const nameKey =
      'route_id' in entity
    ? 'route_short_name'
    : 'patternStops' in entity
    ? 'name'
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
    case 'description':
      return `${entity.service_id} (${entity.description})`
    default:
      return entity[nameKey] || '[no name]'
  }
}

export function getAbbreviatedStopName (stop, maxCharactersPerWord = 10) {
  const stopName = getEntityName('stop', stop)
  const stopNameParts = stopName ? stopName.split(/(\band\b|&|@|:|\+)+/i) : null
  return stopNameParts && stopNameParts.length === 3 && stop.stop_name.length > maxCharactersPerWord * 2
    ? `${stopNameParts[0].substr(0, maxCharactersPerWord).trim()}... ${stopNameParts[2].substr(0, maxCharactersPerWord).trim()}`
    : stop.stop_name
}

export function getControlPoints (pattern, snapToStops) {
  if (!pattern) {
    return []
  }
  const controlPoints = []
  pattern.shape && pattern.patternStops && pattern.patternStops.map((ps, index) => {
    // set distance to average of patternStop and next patternStop, if last stop set to end of segment
    const distance = pattern.patternStops[index + 1]
      ? (pattern.patternStops[index + 1].shapeDistTraveled + ps.shapeDistTraveled) / 2
      : lineDistance(pattern.shape, 'meters')
    const point = pattern.shape && along(pattern.shape, distance, 'meters')
    const PERMANENT = true
    const controlPoint = newControlPoint(distance, point, PERMANENT)
    const stopPoint = pattern.shape && along(pattern.shape, ps.shapeDistTraveled, 'meters')
    const stopControl = newControlPoint(ps.shapeDistTraveled, stopPoint, PERMANENT, ps)
    if (snapToStops) {
      stopControl.hidden = true
    }
    controlPoints.push(stopControl)
    controlPoints.push(controlPoint)
  })
  return controlPoints
}

export function getRouteNameAlerts (route) {
  const routeName = route.route_short_name && route.route_long_name
    ? `${route.route_short_name} - ${route.route_long_name}`
    : route.route_long_name ? route.route_long_name
    : route.route_short_name ? route.route_short_name
    : null
  return routeName
}

export function getRouteName (route) {
  let name = ''
  if (route && route.route_short_name) {
    name += route.route_short_name
    if (route.route_long_name) {
      name += ' - '
    }
  }

  if (route && route.route_long_name) {
    name += route.route_long_name
  }
  if (route && route.route_id && !route.route_long_name && !route.route_short_name) {
    name += route.route_id
  }
  return name
}

export function stopToGtfs (s) {
  if (!s) {
    return null
  }
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

export function stopFromGtfs (stop) {
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
    id: isNew(stop) ? null : stop.id
  }
}

export function routeToGtfs (route) {
  return {
    // datatools props
    id: route.id,
    feedId: route.feedId,
    route_branding_url: route.routeBrandingUrl,
    publiclyVisible: route.publiclyVisible,
    status: route.status,
    numberOfTrips: route.numberOfTrips,

    // gtfs spec props
    agency_id: route.agencyId,
    route_short_name: route.routeShortName,
    route_long_name: route.routeLongName,
    route_desc: route.routeDesc,
    route_type: route.gtfsRouteType,
    route_url: route.routeUrl,
    route_color: route.routeColor,
    route_text_color: route.routeTextColor,
    route_id: route.gtfsRouteId
  }
}

export function agencyToGtfs (agency) {
  return {
    // datatools props
    id: agency.id,
    feedId: agency.feedId,
    agency_branding_url: agency.agencyBrandingUrl,

    // gtfs spec props
    agency_id: agency.agencyId,
    agency_name: agency.name,
    agency_url: agency.url,
    agency_timezone: agency.timezone,
    agency_lang: agency.lang,
    agency_phone: agency.phone,
    agency_fare_url: agency.agencyFareUrl,
    agency_email: agency.email
  }
}

export function calendarToGtfs (cal) {
  return {
    // datatools props
    id: cal.id,
    feedId: cal.feedId,
    description: cal.description,
    routes: cal.routes,
    numberOfTrips: cal.numberOfTrips,

    // gtfs spec props
    service_id: cal.gtfsServiceId,
    monday: cal.monday ? 1 : 0,
    tuesday: cal.tuesday ? 1 : 0,
    wednesday: cal.wednesday ? 1 : 0,
    thursday: cal.thursday ? 1 : 0,
    friday: cal.friday ? 1 : 0,
    saturday: cal.saturday ? 1 : 0,
    sunday: cal.sunday ? 1 : 0,
    start_date: cal.startDate,
    end_date: cal.endDate
  }
}

export function fareToGtfs (fare) {
  return {
    // datatools props
    id: fare.id,
    feedId: fare.feedId,
    description: fare.description,
    fareRules: fare.fareRules,

    // gtfs spec props
    fare_id: fare.gtfsFareId,
    price: fare.price,
    currency_type: fare.currencyType,
    payment_method: fare.paymentMethod,
    transfers: fare.transfers,
    transfer_duration: fare.transferDuration
  }
}

export function gtfsSort (a, b) {
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
