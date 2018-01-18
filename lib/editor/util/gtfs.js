// @flow

import {latLngBounds} from 'leaflet'
// import along from '@turf/along'
// import lineString from 'turf-linestring'
// import lineDistance from 'turf-line-distance'

// import {newControlPoint} from './map'
import type {
  // ControlPoint,
  Entity,
  GtfsRoute,
  GtfsStop,
  Pattern,
  ServiceCalendar // ,
  // PatternStop
} from '../../types'

// export const parseActiveFromRouteParams = (routeParams) => {
//   // TODO: Figure out a better way to parse an integer from react-router route
//   // params.
//   const activeEntityId = +routeParams.activeEntityId
//   const subEntityId = +routeParams.subEntityId
//   return {
//     ...routeParams,
//     activeEntityId,
//     subEntityId
//   }
// }

// FIXME: Add flow.  Consolidate with gtfs/util/getEntityGraphQLRoot
export const COMPONENT_LIST = [
  {id: 'route', tableName: 'routes'},
  {id: 'stop', tableName: 'stops'},
  {id: 'fare', tableName: 'fares'},
  {id: 'feedinfo', tableName: 'feed_info'},
  // FIXME: table name for calendar, fare, and schedule exception
  {id: 'calendar', tableName: 'calendar'},
  {id: 'scheduleexception', tableName: 'scheduleexception'},
  {id: 'agency', tableName: 'agency'}
]

export function getTableById (tableData: any, id: string, emptyArrayOnNull: boolean = true): any {
  const tableName = getKeyForId(id, 'tableName')
  if (!tableName) {
    console.error(`Component ${id} not found in list of tables.`)
    return null
  }
  const table = tableData[tableName]
  // TODO: use Immutable List?
  // If table is null, return empty array if boolean specifies
  // return emptyArrayOnNull
  //   ? List(table) || []
  //   : List(table)
  return emptyArrayOnNull
    ? table || []
    : table
}

export function getKeyForId (id: string, key: string): ?string {
  const component = COMPONENT_LIST.find(c => c.id === id)
  return typeof component !== 'undefined' ? component[key] : null
}

export function isValidComponent (id: string): boolean {
  return COMPONENT_LIST.findIndex(c => c.id === id) !== -1
}

export function getEditorNamespace (feedSourceId: string, state: any) {
  // if (!state.projects.all) return null
  for (var i = 0; i < state.projects.all.length; i++) {
    const project = state.projects.all[i]
    const feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
    if (feedSource) return feedSource.editorNamespace
  }
}

export const subComponentList: Array<string> = ['trippattern']
export const subSubComponentList: Array<string> = ['timetable']

export function getEntityBounds (entity: ?Entity, offset: number = 0.005): ?latLngBounds {
  if (!entity) return null

  if (entity.constructor === Array) {
    // [lng, lat]
    return latLngBounds([
      [entity[1] + offset, entity[0] - offset],
      [entity[1] - offset, entity[0] + offset]
    ])
  } else if (typeof entity.stop_lat === 'number' && typeof entity.stop_lon === 'number') {
    // stop
    return latLngBounds([
      [entity.stop_lat + offset, entity.stop_lon - offset],
      [entity.stop_lat - offset, entity.stop_lon + offset]
    ])
  } else if (typeof entity.route_id === 'string') {
    // route
    const route: GtfsRoute = ((entity: any): GtfsRoute)
    let coordinates = []
    if (route.tripPatterns) {
      route.tripPatterns.map(pattern => {
        if (pattern.shape && pattern.shape.coordinates) {
          coordinates = [
            ...coordinates,
            ...pattern.shape.coordinates.map(c => [c[1], c[0]])
          ]
        }
      })
    }
    // Return null if no coordinates are present (i.e., route has no trip patterns)
    return coordinates.length > 0
      ? latLngBounds(coordinates)
      : null
  } else if (entity.shape) {
    // trip pattern
    const pattern: Pattern = ((entity: any): Pattern)
    return latLngBounds(pattern.shape.coordinates.map(c => [c[1], c[0]]))
  } else if (entity.patternStops) {
    // TODO: add pattern stops bounds extraction
    return null
  }
}

export function findEntityByGtfsId (
  component: string,
  gtfsId: string,
  entities: Array<Entity>
): string {
  let entity
  switch (component) {
    // we need these if statements in there to make flow happy
    // see: https://flow.org/en/docs/types/unions/#toc-union-types-requires-one-in-but-all-out
    case 'stop':
      entity = entities.find((e) => {
        if (e.gtfsStopId) {
          return e.gtfsStopId === gtfsId
        }
      })
      break
    case 'route':
      entity = entities.find(e => {
        if (e.gtfsRouteId) {
          return e.gtfsRouteId === gtfsId
        }
      })
      break
    case 'calendar':
      entity = entities.find(e => {
        if (e.gtfsServiceId) {
          return e.gtfsServiceId === gtfsId
        }
      })
      break
    default:
      return '-1'
  }

  return entity ? (entity.id ? entity.id : '-1') : '-1'
}

export function getEntityName (entity: ?Entity): string {
  if (!entity) {
    return '[Unnamed]'
  }

  let nameKey: string = '[Unnamed]'

  if (entity.route_id) {
    nameKey = 'route_short_name'
  } else if (entity.patternStops) {
    nameKey = 'name'
  } else if (entity.agency_name) {
    nameKey = 'agency_name'
  } else if (entity.stop_id) {
    nameKey = 'stop_name'
  } else if (entity.service_id) {
    nameKey = 'description'
  } else if (entity.fare_id) {
    nameKey = 'fare_id'
  } else if (entity.exemplar) {
    nameKey = 'name'
  }

  // if (nameKey !== 'stop_name') console.log(nameKey)
  switch (nameKey) {
    case 'stop_name':
      const stop: GtfsStop = ((entity: any): GtfsStop)
      return stop.stop_name && stop.stop_code
        ? `${stop.stop_name} (${stop.stop_code})`
        : stop.stop_name && stop.stop_id
          ? `${stop.stop_name} (${stop.stop_id})`
          : stop.stop_name || '[no name]'
    case 'route_short_name':
      const route: GtfsRoute = ((entity: any): GtfsRoute)
      if (route.route_short_name &&
        route.route_long_name &&
        route.route_short_name !== '""' &&
        route.route_long_name !== '""') {
        return `${route.route_short_name} - ${route.route_long_name}`
      } else if (route.route_short_name && route.route_short_name !== '""') {
        return route.route_short_name
      } else if (route.route_long_name && route.route_long_name !== '""') {
        return route.route_long_name
      } else {
        return '[no name]'
      }
    case 'description': // service calendar
      const serviceCalendar: ServiceCalendar = ((entity: any): ServiceCalendar)
      return `${serviceCalendar.service_id} ${serviceCalendar.description
        ? `(${serviceCalendar.description})`
        : ''}`
    default:
      const otherEntityType: any = entity
      return otherEntityType[nameKey] || '[no name]'
  }
}

export function getAbbreviatedStopName (stop: GtfsStop, maxCharactersPerWord: number = 10): string {
  const stopName = getEntityName(stop)
  const stopNameParts = stopName ? stopName.split(/(\band\b|&|@|:|\+)+/i) : null
  return stopNameParts &&
  stopNameParts.length === 3 &&
  stop.stop_name.length > maxCharactersPerWord * 2
    ? `${stopNameParts[0]
        .substr(0, maxCharactersPerWord)
        .trim()}... ${stopNameParts[2].substr(0, maxCharactersPerWord).trim()}`
    : stop.stop_name
}

// export function getControlPoints (
//   pattern: ?any,
//   stops: any,
//   snapToStops: boolean
// ): Array<ControlPoint> {
//   if (pattern || !pattern || !pattern.shape || !pattern.patternStops) {
//     return []
//   }
//
//   const controlPoints = []
//   const {patternStops, shape, shapePoints} = pattern
//   const hasShapePoints = shapePoints.length > 0
//   patternStops.map(ps => {
//     const stop = stops && stops.find(st => st.stop_id === ps.stopId)
//     if (!stop) console.warn(`No stop found for pattern stop ID: ${ps.stopId}`, stops)
//     return [stop.stop_lon, stop.stop_lat]//, ShapePoint.STOP]
//   })
//   if (hasShapePoints) {
//     if (patternStops[0] && patternStops[0].shapeDistTraveled === null) {
//       // if distance values are null, calculate distance values.
//       // FIXME
//       // calculateShapeDistTraveled(pattern, stops)
//       naiveShapeDistTraveled(pattern, stops)
//     } else {
//       // FIXME: this should be moved out of the else clause
//       // Add projected stops at shape dist traveled for pattern stops
//       for (var i = 0; i < patternStops.length; i++) {
//         const patternStop = patternStops[i]
//         // const next = patternStops[i + 1]
//         // set distance to average of patternStop and next patternStop, if last stop set to end of segment
//         const distance = patternStop.shapeDistTraveled
//         const point = along(lineString, distance, {units: 'meters'})
//       }
//     }
//   }
//   try {
//     patternStops.map((patternStop: PatternStop, index) => {
//       // set distance to average of patternStop and next patternStop, if last stop set to end of segment
//       const distance = patternStops[index + 1]
//         ? (patternStops[index + 1].shapeDistTraveled +
//             patternStop.shapeDistTraveled) /
//           2
//         : lineDistance(shape, 'meters')
//       const point = along(shape, distance, {units: 'meters'})
//       const controlPoint = newControlPoint(distance, point, true)
//       const stopPoint = along(shape, patternStop.shapeDistTraveled, {units: 'meters'})
//       const stopControl = newControlPoint(
//         patternStop.shapeDistTraveled,
//         stopPoint,
//         true,
//         patternStop
//       )
//       if (snapToStops) {
//         stopControl.hidden = true
//       }
//       controlPoints.push(stopControl)
//       controlPoints.push(controlPoint)
//     })
//
//     return controlPoints
//   } catch (e) {
//     console.error('Error constructing control points', e)
//     return []
//   }
// }

export function getRouteNameAlerts (route: GtfsRoute): string | null {
  const routeName =
    route.route_short_name && route.route_long_name
      ? `${route.route_short_name} - ${route.route_long_name}`
      : route.route_long_name
        ? route.route_long_name
        : route.route_short_name ? route.route_short_name : null
  return routeName
}

export function getRouteName (route: ?GtfsRoute): string {
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
  if (
    route &&
    route.route_id &&
    !route.route_long_name &&
    !route.route_short_name
  ) {
    name += route.route_id
  }
  return name
}

export function gtfsSort (a: Entity, b: Entity): number {
  const radix = 10
  var aName = getEntityName(a)
  var bName = getEntityName(b)
  if (a.isCreating && !b.isCreating) return -1
  if (!a.isCreating && b.isCreating) return 1
  if (
    !isNaN(parseInt(aName, radix)) &&
    !isNaN(parseInt(bName, radix)) &&
    !isNaN(+aName) &&
    !isNaN(+bName)
  ) {
    if (parseInt(aName, radix) < parseInt(bName, radix)) return -1
    if (parseInt(aName, radix) > parseInt(bName, radix)) return 1
    return 0
  }
  if (aName.toLowerCase() < bName.toLowerCase()) return -1
  if (aName.toLowerCase() > bName.toLowerCase()) return 1
  return 0
}
