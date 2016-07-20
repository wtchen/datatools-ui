import along from 'turf-along'
import lineDistance from 'turf-line-distance'

export const getEntityName = (component, entity) => {
  if (!entity) {
    return '[Unnamed]'
  }
  let entName = component === 'agency'
    ? 'agency_name'
    : component === 'route'
    ? 'route_short_name'
    : component === 'stop'
    ? 'stop_name'
    : component === 'calendar'
    ? 'description'
    : component === 'fare'
    ? 'fare_id'
    : component === 'scheduleexception'
    ? 'name'
    : null
  switch (component) {
    case 'route':
      return entity.route_short_name && entity.route_long_name
        ? `${entity.route_short_name} - ${entity.route_long_name}`
        : entity.route_short_name
        ? entity.route_short_name
        : entity.route_long_name
        ? entity.route_long_name
        : entity.route_id
    default:
      return entity[entName]
  }
}

export const gtfsIcons = [
  {
    id: 'feedinfo',
    icon: 'info',
    title: 'Edit feed info'
  },
  {
    id: 'agency',
    icon: 'building',
    title: 'Edit agencies'
  },
  {
    id: 'route',
    icon: 'bus',
    title: 'Edit routes'
  },
  {
    id: 'stop',
    icon: 'map-marker',
    title: 'Edit stops'
  },
  {
    id: 'calendar',
    icon: 'calendar',
    title: 'Edit calendars'
  },
  {
    id: 'fare',
    icon: 'ticket',
    title: 'Edit fares'
  }
]

export const getControlPoints = (pattern, snapToStops) => {
  if (!pattern) {
    return []
  }
  let controlPoints = []
  pattern.patternStops && pattern.patternStops.map((ps, index) => {
    // set distance to average of patternStop and next patternStop, if last stop set to end of segment
    let distance = pattern.patternStops[index + 1]
      ? (pattern.patternStops[index + 1].shapeDistTraveled + ps.shapeDistTraveled) / 2
      : lineDistance(pattern.shape, 'meters')
    let point = along(pattern.shape, distance, 'meters')
    let controlPoint = {
      point,
      distance: distance,
      permanent: true
    }
    let stopPoint = along(pattern.shape, ps.shapeDistTraveled, 'meters')
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
    return
  })
  return controlPoints
}
