// @flow

export function getEntityIdField (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
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

export function getEntityGraphQLRoot (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
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

export function getEntityTableString (type: string): string {
  if (!type) return ''
  switch (type.toLowerCase()) {
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
