export const getEntityName = (component, entity) => {
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
