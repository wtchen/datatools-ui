// @flow

import clone from 'lodash.clonedeep'
// import distance from '@turf/distance'
// import point from 'turf-point'

import {ENTITY} from '../constants'
// import {ensureValidCoords} from '../util/map'
// import snakeCaseKeys from 'snakecase-keys'
import camelcaseKeys from 'camelcase-keys'

import type {
  Agency,
  Calendar,
  Entity,
  Fare,
  GtfsAgency,
  GtfsCalendar,
  GtfsFare,
  GtfsRoute,
  // GtfsStop,
  Route // ,
  // Stop
} from '../../types'

export function entityIsNew (entity: Entity): boolean {
  return entity.id === ENTITY.NEW_ID || typeof entity.id === 'undefined'
}

export const getMapToGtfsStrategy = (component: string) => {
  switch (component) {
    case 'agency':
      return agencyToGtfs
    case 'route':
      return routeToGtfs
    case 'stop':
      return stopToGtfs
    case 'calendar':
      return calendarToGtfs
    case 'fare':
      return fareToGtfs // no mapping exists for fares
    default:
      return (entity: any) => entity
  }
}

export const getMapFromGtfsStrategy = (component: string) => {
  switch (component) {
    case 'agency':
      return agencyFromGtfs
    case 'route':
      return routeFromGtfs
    case 'stop':
      return stopFromGtfs
    case 'calendar':
      return calendarFromGtfs
    case 'fare': // no mapping exists for fares
    default:
      return (entity: any) => entity
  }
}

export function stopToGtfs (s: any): any {
  return s
  // return {
  //   // datatools props
  //   id: s.id,
  //   feedId: s.feedId,
  //   pickupType: s.pickupType,
  //   dropOffType: s.dropOffType,
  //
  //   // gtfs spec props
  //   stop_code: s.stopCode,
  //   stop_name: s.stopName,
  //   stop_desc: s.stopDesc,
  //   stop_lat: s.lat,
  //   stop_lon: s.lon,
  //   zone_id: s.zoneId,
  //   stop_url: s.stopUrl,
  //   location_type: s.locationType,
  //   parent_station: s.parentStation,
  //   stop_timezone: s.stopTimezone,
  //   wheelchair_boarding: s.wheelchairBoarding,
  //   stop_id: s.gtfsStopId
  // }
}

export function stopFromGtfs (stop: any): any {
  // FIXME
  const data = {...stop}
  delete data.isCreating
  delete data.id
  return data
  // return {
  //   dropOffType: stop.dropOffType,
  //   feedId: stop.feedId,
  //   gtfsStopId: stop.stop_id,
  //   id: entityIsNew(stop) ? null : stop.id,
  //   lat: stop.stop_lat,
  //   locationType: stop.location_type,
  //   lon: stop.stop_lon,
  //   parentStation: stop.parent_station,
  //   pickupType: stop.pickupType,
  //   stopCode: stop.stop_code,
  //   stopDesc: stop.stop_desc,
  //   stopName: stop.stop_name,
  //   stopTimezone: stop.stop_timezone,
  //   stopUrl: stop.stop_url,
  //   wheelchairBoarding: stop.wheelchair_boarding,
  //   zoneId: stop.zone_id
  // }
}

/**
 * Adds shape geometry to trip pattern object.
 */
export function tripPatternToGtfs (tripPattern: any, stops: any): any {
  console.log(`converting trip pattern to gtfs`)
  // FIXME: Hack to avoid turning coordinates array into array of objects, e.g.
  // [{0: 37.445, 1: -87.564}, ...]
  // const coordinates = tripPattern.shape.coordinates.slice()
  const pattern = camelcaseKeys(tripPattern, {deep: true})
  let {shapePoints} = pattern
  if (!shapePoints) {
    // FIXME: Hack to handle different name of shapePoints key when returned fromLat
    // saveTripPattern
    shapePoints = pattern.shapePoints = clone(pattern.shapes)
  }
  delete pattern.shape
  delete pattern.shapes
  const coordinates = coordinatesFromShapePoints(shapePoints)
  if (coordinates && coordinates.length) {
    pattern.shape = {type: 'LineString', coordinates}
  }
  return pattern
}

export function coordinatesFromShapePoints (shapePoints: any) {
  const hasShapePoints = shapePoints.length > 0
  if (!hasShapePoints) return []
  const coordinates = shapePoints
    .map(shapePointToCoordinate)
    .filter(sp => sp)
  if (coordinates.length === 0) {
    console.warn('Warning! Pattern coordinates is empty array')
  }
  return coordinates
}

export function shapePointToCoordinate (shapePoint: any, index: number) {
  const {shapePtLon, shapePtLat} = shapePoint
  if (shapePtLon !== null && shapePtLon !== undefined && shapePtLat !== null && shapePtLat !== undefined) {
    return [shapePtLon, shapePtLat]
  } else {
    console.warn(`Shape point index=${index} has undefined or null shaptPtLat or shapePtLon`)
    return null
  }
}

// function insertPointIntoShape (pointIndex, lat, lng, shape) {
//
// }

// /**
//  * Calculate the shape dist traveled along the current shape. Do this by snapping points but constraining order.
//  * To make this a bit more formal, here is the algorithm:
//  * 1. We snap each stop to the nearest point on the shape, sliced by the shape_dist_traveled of the previous stop to ensure monotonicity.
//  * 2. then compute the distance from stop to snapped point
//  * 3. multiply by 2, create a buffer of that radius around the stop, and intersect with the shape.
//  * 4. if it intersects in 1 or 2 places, assume that you have found the correct location for that stop and
//  *    "fix" it into that position.
//  * 5. otherwise, mark it to be returned to on the second pass
//  * 6. on the second pass, just snap to the closest point on the subsection of the shape defined by the previous and next stop positions.
//  */
// function calculateShapeDistTraveled (pattern, stops) {
//   let {id, name, routeId, patternStops, shape} = pattern
//   if (patternStops.length === 0) return
//
//   // we don't actually store shape_dist_traveled, but rather the distance from the previous point along the shape
//   // however, for the algorithm it's more useful to have the cumulative dist traveled
//   const shapeDistTraveled = []
//   // let useStraightLineDistances = false
//   if (shape === null) {
//     calculateShapeDistTraveledStraightLine(pattern, stops)
//     return
//   }
//   // compute the shape dist traveled of each coordinate of the shape
//   const shapeDist = getCoordDistances(shape)
//   let coordDist = shapeDist
//   for (let i = 0; i < shapeDistTraveled.length; i++) {
//     shapeDistTraveled[i] = -1
//   }
//
//   // location along the entire shape
//   // FIXME
//   const shapeIdx = null // new LocationIndexedLine(shape)
//   // location along the subline currently being considered
//   let subIdx = shapeIdx
//   let subShape
//   let lastShapeDistTraveled = 0
//   let fixed = 0
//
//   // detect backwards shapes
//   let backwards = 0
//   let lastPos = -1
//   for (const tps of patternStops) {
//     const stop = stops.get(tps.stopId)
//     let pos = getDist(shapeDist, shapeIdx.project(stop.location.getCoordinate()))
//     if (lastPos > 0) {
//       if (pos > lastPos) {
//         backwards--
//       } else if (pos > lastPos) {
//         backwards++
//       }
//     }
//     lastPos = pos
//   }
//
//   if (backwards > 0) {
//     console.warn(`Detected likely backwards shape for trip pattern ${id} (${name}) on route ${routeId}, reversing`)
//     shape = shape.reverse() // FIXME
//     calculateShapeDistTraveled(pattern, stops)
//     return
//   } else if (backwards === 0) {
//     console.warn(`Unable to tell if shape is backwards for trip pattern ${id} (${name}) on route ${routeId}, assuming it is correct`)
//   }
//
//   // first pass: fix the obvious stops
//   for (let i = 0; i < shapeDistTraveled.length; i++) {
//     const tps = patternStops.get(i)
//     const stop = stops[tps.stopId]
//     // FIXME
//     const candidateLoc = subIdx.project(stop.location.getCoordinate())
//     const candidatePt = subIdx.extractPoint(candidateLoc)
//
//     // step 2: compute distance
//     const dist = distance(pointFromStop(stop), candidatePt, {units: 'meters'})
//
//     // don't snap stops more than 1km
//     if (dist > 1000) {
//       console.warn(`Stop is more than 1km from its shape, using straight-line distances`)
//       calculateShapeDistTraveledStraightLine(pattern, stops)
//       return
//     }
//
//     // step 3: compute buffer
//     // add 5m to the buffer so that if the stop sits exactly atop two lines we don't just pick one
//     const buffer = bufferGeographicPoint(pointFromStop(stop), dist * 2 + 5, 20)
//
//     // FIXME
//     const intersection = buffer.intersection(shape)
//     if (intersection.getNumGeometries() === 1) {
//       // good, only one intersection
//       shapeDistTraveled[i] = lastShapeDistTraveled + getDist(coordDist, candidateLoc)
//       lastShapeDistTraveled = shapeDistTraveled[i]
//
//       // recalculate shape dist traveled and idx
//       // FIXME
//       subShape = subIdx.extractLine(candidateLoc, subIdx.getEndIndex())
//       // FIXME
//       // subIdx = new LocationIndexedLine(subShape)
//
//       coordDist = getCoordDistances(subShape)
//
//       fixed++
//     }
//   }
//
//   console.log(`Fixed ${fixed} / ${shapeDistTraveled.length} stops after first round for trip pattern ${id} (${name}) on route ${routeId}`)
//
//   // pass 2: fix the rest of the stops
//   lastShapeDistTraveled = 0
//   for (let i = 0; i < shapeDistTraveled.length; i++) {
//     const tps = patternStops[i]
//     const stop = stops.get(tps.stopId)
//
//     if (shapeDistTraveled[i] >= 0) {
//       lastShapeDistTraveled = shapeDistTraveled[i]
//       continue
//     }
//
//     // find the next shape dist traveled
//     let nextShapeDistTraveled = shapeDist[shapeDist.length - 1]
//     for (let j = i; j < shapeDistTraveled.length; j++) {
//       if (shapeDistTraveled[j] >= 0) {
//         nextShapeDistTraveled = shapeDistTraveled[j]
//         break
//       }
//     }
//
//     // create and index the subshape
//     // recalculate shape dist traveled and idx
//     // FIXME
//     subShape = shapeIdx.extractLine(getLoc(shapeDist, lastShapeDistTraveled), getLoc(shapeDist, nextShapeDistTraveled))
//     // FIXME
//     if (subShape.getLength() < 0.00000001) {
//       console.warn(`Two stops on trip pattern {} map to same point on shape`, id)
//       shapeDistTraveled[i] = lastShapeDistTraveled
//       continue
//     }
//     // FIXME
//     // subIdx = new LocationIndexedLine(subShape)
//
//     coordDist = getCoordDistances(subShape)
//
//     const loc = subIdx.project(stop.location.getCoordinate())
//     shapeDistTraveled[i] = lastShapeDistTraveled + getDist(coordDist, loc)
//     lastShapeDistTraveled = shapeDistTraveled[i]
//   }
//
//   // assign default distances
//   for (let i = 0; i < shapeDistTraveled.length; i++) {
//     patternStops.get(i).shapeDistTraveled = shapeDistTraveled[i]
//   }
// }

// function bufferGeographicPoint (point, dist, npoints) {
//   // FIXME
//   // calc.setStartingGeographicPoint(point.x, point.y)
//   const coords = []
//   for (let i = 0; i < npoints; i++) {
//     // FIXME
//     // const deg = -180 + i * 360 / npoints
//     // calc.setDirection(deg, dist)
//     // const dest = calc.getDestinationGeographicPoint()
//     // coords[i] = new Coordinate(dest.getX(), dest.getY())
//   }
//
//   coords[npoints] = Object.assign({}, coords[0])
//   // FIXME
//   // const ring = geometryFactory.createLinearRing(coords)
//   // const holes = new LinearRing[0]
//   return {}
//   // return geometryFactory.createPolygon(ring, holes)
// }

// /**
//  * Retrieve the distances from the start of the line string to every coordinate
//  * along the line string.
//  */
// function getCoordDistances (line) {
//   const coordDist = []
//   coordDist[0] = 0
//   let prev = point(line.coordinates[0])
//   for (let j = 1; j < coordDist.length; j++) {
//     const current = point(line.coordinates[j])
//     if (isNaN(prev.geometry.coordinates[0])) {
//       coordDist[j] = 0
//       continue
//     }
//     coordDist[j] = coordDist[j - 1] + distance(prev, current, {units: 'meters'})
//     prev = current
//   }
//
//   return coordDist
// }

// /** Calculate distances using straight line geometries */
// function calculateShapeDistTraveledStraightLine (pattern, stops) {
//   const {patternStops} = pattern
//   // const useStraightLineDistances = true
//   const prev = stops.get(patternStops.get(0).stopId)
//   patternStops.get(0).shapeDistTraveled = 0
//   let previousDistance = 0
//   for (let i = 1; i < patternStops.length; i++) {
//     const ps = patternStops.get(i)
//     const stop = stops.get(ps.stopId)
//     previousDistance = ps.shapeDistTraveled = previousDistance + distance(pointFromStop(prev), pointFromStop(stop), {units: 'meters'})
//   }
// }

// function pointFromStop (stop) {
//   return point([stop.stop_lon, stop.stop_lat])
// }

// /**
//  * From an array of distances at coordinates and a distance, retrieveById a linear location for that distance.
//  */
// function getLoc (distances, distTraveled) {
//   if (distTraveled < 0) return null
//   // this can happen due to rounding errors
//   else if (distTraveled >= distances[distances.length - 1]) {
//     console.warn(`Shape dist traveled past end of shape, was ${distTraveled}, expected max ${distances[distances.length - 1]}, clamping`)
//     // FIXME
//     // return new LinearLocation(distances.length - 1, 0)
//   }
//   for (let i = 1; i < distances.length; i++) {
//     if (distTraveled <= distances[i]) {
//       // we have found the appropriate segment
//       const frac = (distTraveled - distances[i - 1]) / (distances[i] - distances[i - 1])
//       // FIXME
//       return frac
//       // return new LinearLocation(i - 1, frac)
//     }
//   }
//   return null
// }
//
// /**
//  * From an array of distances at coordinates and linear locs, retrieveById a distance for that location.
//  */
// function getDist (distances, loc) {
//   if (loc.getSegmentIndex() === distances.length - 1) {
//     return distances[distances.length - 1]
//   }
//
//   return distances[loc.getSegmentIndex()] + (distances[loc.getSegmentIndex() + 1] - distances[loc.getSegmentIndex()]) * loc.getSegmentFraction()
// }

export function routeToGtfs (route: any): any {
  if (route.tripPatterns) {
    route.tripPatterns = route.tripPatterns.map(tripPatternToGtfs)
  }
  return route
  // return {
  //   // datatools props
  //   id: route.id,
  //   feedId: route.feedId,
  //   route_branding_url: route.routeBrandingUrl,
  //   publiclyVisible: route.publiclyVisible,
  //   status: route.status,
  //   numberOfTrips: (route.numberOfTrips || 0),
  //
  //   // gtfs spec props
  //   agency_id: route.agencyId,
  //   route_short_name: route.routeShortName,
  //   route_long_name: route.routeLongName,
  //   route_desc: route.routeDesc,
  //   route_type: route.gtfsRouteType,
  //   route_url: route.routeUrl,
  //   route_color: route.routeColor,
  //   route_text_color: route.routeTextColor,
  //   route_id: route.gtfsRouteId,
  //   wheelchair_boarding: route.wheelchairBoarding
  // }
}

export function routeFromGtfs (route: GtfsRoute): Route {
  return route
  // return {
  //   agencyId: route.agency_id,
  //   feedId: route.feedId,
  //   gtfsRouteId: route.route_id,
  //   gtfsRouteType: route.route_type,
  //   id: entityIsNew(route) ? null : route.id,
  //   publiclyVisible: route.publiclyVisible,
  //   routeBrandingUrl: route.route_branding_url,
  //   routeColor: route.route_color,
  //   routeDesc: route.route_desc,
  //   routeLongName: route.route_long_name,
  //   routeShortName: route.route_short_name,
  //   routeTextColor: route.route_text_color,
  //   routeUrl: route.route_url,
  //   status: route.status,
  //   wheelchairBoarding: route.wheelchair_boarding
  // }
}

export function agencyFromGtfs (agency: GtfsAgency): Agency {
  // FIXME
  const data = {...agency}
  delete data.isCreating
  delete data.id
  return data
}

export function agencyToGtfs (agency: Agency): GtfsAgency {
  return agency
  // return {
  //   // datatools props
  //   id: agency.id,
  //   feedId: agency.feedId,
  //   agency_branding_url: agency.agencyBrandingUrl,
  //
  //   // gtfs spec props
  //   agency_id: agency.agencyId,
  //   agency_name: agency.name,
  //   agency_url: agency.url,
  //   agency_timezone: agency.timezone,
  //   agency_lang: agency.lang,
  //   agency_phone: agency.phone,
  //   agency_fare_url: agency.agencyFareUrl,
  //   agency_email: agency.email
  // }
}

export function scheduleExceptionFromGtfs (scheduleException) {
  // FIXME
  const data = {...scheduleException}
  delete data.isCreating
  delete data.id
  return data
  // {
  //   // datatools props
  //   id: entityIsNew(scheduleException) ? null : scheduleException.id,
  //   name: scheduleException.name,
  //   feedId: scheduleException.feedId,
  //   exemplar: scheduleException.exemplar,
  //   dates: scheduleException.dates,
  //   customSchedule: scheduleException.customSchedule,
  //   removedService: scheduleException.removedService,
  //   addedService: scheduleException.addedService
  //
  //   // gtfs spec props
  //   // gtfs_prop: scheduleException.gtfs_prop
  // }
}

export function calendarFromGtfs (calendar) {
  // FIXME
  const data = {...calendar}
  delete data.isCreating
  delete data.id
  return data
  // return {
  //   // datatools props
  //   feedId: calendar.feedId,
  //   description: calendar.description,
  //
  //   // gtfs spec props
  //   gtfsServiceId: calendar.service_id,
  //   monday: calendar.monday === 1,
  //   tuesday: calendar.tuesday === 1,
  //   wednesday: calendar.wednesday === 1,
  //   thursday: calendar.thursday === 1,
  //   friday: calendar.friday === 1,
  //   saturday: calendar.saturday === 1,
  //   sunday: calendar.sunday === 1,
  //   startDate: calendar.start_date,
  //   endDate: calendar.end_date,
  //   id: entityIsNew(calendar) null : calendar.id
  // }
}

export function calendarToGtfs (cal: Calendar): GtfsCalendar {
  return cal
  // return {
  //   // datatools props
  //   id: cal.id,
  //   feedId: cal.feedId,
  //   description: cal.description,
  //   routes: cal.routes,
  //   numberOfTrips: cal.numberOfTrips,
  //
  //   // gtfs spec props
  //   service_id: cal.gtfsServiceId,
  //   monday: cal.monday ? 1 : 0,
  //   tuesday: cal.tuesday ? 1 : 0,
  //   wednesday: cal.wednesday ? 1 : 0,
  //   thursday: cal.thursday ? 1 : 0,
  //   friday: cal.friday ? 1 : 0,
  //   saturday: cal.saturday ? 1 : 0,
  //   sunday: cal.sunday ? 1 : 0,
  //   start_date: cal.startDate,
  //   end_date: cal.endDate
  // }
}

export function fareFromGtfs (fare) {
  // FIXME
  const data = {...fare}
  delete data.isCreating
  delete data.id
  return data
  // return {
  //   // datatools props
  //   id: entityIsNew(fare) ? null : fare.id,
  //   feedId: fare.feedId,
  //   description: fare.description,
  //   fare_rules: fare.fare_rules,
  //
  //   // gtfs spec props
  //   gtfsFareId: fare.fare_id,
  //   price: fare.price,
  //   currencyType: fare.currency_type,
  //   paymentMethod: fare.payment_method,
  //   transfers: fare.transfers,
  //   transferDuration: fare.transfer_duration
  // }
}

export function fareToGtfs (fare: Fare): GtfsFare {
  return fare
  // return {
  //   // datatools props
  //   id: fare.id,
  //   feedId: fare.feedId,
  //   description: fare.description,
  //   fare_rules: fare.fare_rules,
  //
  //   // gtfs spec props
  //   fare_id: fare.gtfsFareId,
  //   price: fare.price,
  //   currency_type: fare.currencyType,
  //   payment_method: fare.paymentMethod,
  //   transfers: fare.transfers,
  //   transfer_duration: fare.transferDuration
  // }
}
