// @flow

import {getConfigProperty} from '../../common/util/config'

export function getEntityIdField (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
    case 'agency':
      return 'agency_id'
    case 'fare':
      return 'fare_id'
    case 'calendar':
      return 'service_id'
    case 'stop':
      return 'stop_id'
    case 'route':
      return 'route_id'
    case 'trip':
      return 'trip_id'
    case 'stoptime':
      return 'trip_id'
    case 'service':
      return 'service_id'
    case 'pattern':
      return 'pattern_id'
    default:
      return ''
  }
}

export function getGraphQLFieldsForEntity (type, editor = false) {
  const gtfsSpec = getConfigProperty('modules.editor.spec')
  const entityTableString = getEntityTableString(type)
  const table = gtfsSpec.find(table => table.id === entityTableString)
  let fields = ''
  if (table) {
    fields = table.fields
      // Only filter required fields if not fetching for editor
      // FIXME: add missing datatools fields to graphql
      .filter(field => editor ? !field.datatools : field.required && !field.datatools)
      .map(field => field.name)
      .join('\n')
    // stop_times are a special case because they must be requested as a
    // nested list underneath a trip
    console.log(type)
    switch (type.toLowerCase()) {
      case 'stoptime':
        return `
          trip_id
          stop_times {
            ${fields}
          }
        `
      case 'fare':
        console.log('getting fare fields')
        return `
          ${fields}
          fare_rules {
            id
            fare_id
            route_id
            origin_id
            destination_id
            contains_id
          }
        `
      case 'route':
        return `
          ${fields}
          tripPatterns: patterns {
            id
            shape_id
            patternId: pattern_id
            tripCount: trip_count
            routeId: route_id
            name
            patternStops: stops {
              id
              stop_id
              default_travel_time
              default_dwell_time
              stop_sequence
              shape_dist_traveled
            }
            shapePoints: shape (limit: -1) {
              shape_pt_lon
              shape_pt_lat
              shape_pt_sequence
              point_type
              shape_dist_traveled
            }
          }
        `
      default:
        return fields
    }
  } else {
    console.error(`Could not find table fare entity ${type}`)
    return ''
  }
}

export function getEntityGraphQLRoot (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
    case 'agency':
      return 'agency'
    case 'calendar':
      return 'calendar'
    case 'fare':
      return 'fares'
    case 'stop':
      return 'stops'
    case 'route':
      return 'routes'
    case 'trip':
      return 'trips'
    case 'stoptime':
      return 'trips'
    case 'service':
      return 'services'
    case 'pattern':
      return 'patterns'
    default:
      return ''
  }
}

/**
 * Takes a entity component type and returns the gtfs.yml table id
 */
export function getEntityTableString (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
    case 'agency':
      return 'agency'
    case 'calendar':
      return 'calendar'
    case 'fare':
      return 'fare_attributes'
    case 'stop':
      return 'stop'
    case 'route':
      return 'route'
    case 'trip':
      return 'trip'
    case 'stoptime':
      return 'stop_time'
    case 'service':
      return 'services'
    case 'pattern':
      return 'patterns'
    default:
      return ''
  }
}
