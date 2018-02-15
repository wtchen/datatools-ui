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

/**
 * Constructs GraphQL fields to query on for the specified GTFS entity type. If
 * constructing fields for the editor, all fields will be returned because the
 * backend fills in any missing table fields when creating a snapshot for the
 * editor. Otherwise, only the required fields will be included in the returned
 * set of fields.
 */
export function getGraphQLFieldsForEntity (type: string, editor: boolean = false) {
  // Find table for provided type.
  const gtfsSpec = getConfigProperty('modules.editor.spec')
  const entityTableString = getEntityTableString(type)
  const table = gtfsSpec.find(table => table.id === entityTableString)
  let fields = ''
  if (table) {
    fields = table.fields
      // Only filter required fields if not fetching for editor
      // FIXME: Check that ALL missing datatools fields are in GraphQL schema
      .filter(field => editor ? field : field.required && !field.datatools)
      .map(field => field.name)
      .join('\n')
    // stop_times are a special case because they must be requested as a
    // nested list underneath a trip
    // console.log(type)
    switch (type.toLowerCase()) {
      case 'stoptime':
        return `
          trip_id
          stop_times {
            ${fields}
          }
        `
      case 'fare':
        // console.log('getting fare fields')
        return `
          ${fields}
          fare_rules (limit: -1) {
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
          tripPatterns: patterns (limit: -1) {
            id
            shape_id
            pattern_id
            trip_count
            route_id
            direction_id
            use_frequency
            name
            pattern_stops (limit: -1) {
              id
              stop_id
              default_travel_time
              default_dwell_time
              stop_sequence
              shape_dist_traveled
              pickup_type
              drop_off_type
              timepoint
            }
            shape_points: shape (limit: -1) {
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
    case 'feedinfo':
      return 'feed_info'
    case 'stop':
      return 'stops'
    case 'route':
      return 'routes'
    case 'trip':
      return 'trips'
    case 'stoptime':
      return 'trips'
    case 'scheduleexception':
      return 'schedule_exceptions'
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
    case 'fare_rules':
      return 'fare_rules'
    case 'feedinfo':
      return 'feedinfo'
    case 'stop':
      return 'stop'
    case 'route':
      return 'route'
    case 'trip':
      return 'trip'
    case 'scheduleexception':
      return 'scheduleexception'
    case 'stoptime':
      return 'stop_time'
    case 'service':
      return 'services'
    case 'pattern':
      return 'patterns'
    default:
      console.warn(`No table ID found for entity type ${type}.`)
      return ''
  }
}
