// @flow

export const GTFS_ICONS = [
  {
    id: 'feedinfo',
    tableName: 'feedinfo',
    icon: 'info',
    addable: false,
    title: 'Edit feed info',
    label: 'Feed Info'
  },
  {
    id: 'agency',
    tableName: 'agency',
    icon: 'building',
    addable: true,
    title: 'Edit agencies',
    label: 'Agencies'
  },
  {
    id: 'route',
    tableName: 'routes',
    icon: 'bus',
    addable: true,
    title: 'Edit routes',
    label: 'Routes'
  },
  {
    id: 'stop',
    tableName: 'stops',
    icon: 'map-marker',
    addable: true,
    title: 'Edit stops',
    label: 'Stops'
  },
  {
    id: 'calendar',
    tableName: 'calendar',
    icon: 'calendar',
    addable: true,
    title: 'Edit calendars',
    label: 'Calendars'
  },
  {
    id: 'scheduleexception',
    tableName: 'scheduleexception',
    icon: 'ban',
    addable: true,
    hideSidebar: true,
    title: 'Edit schedule exceptions',
    label: 'Schedule Exceptions'
  },
  {
    id: 'fare',
    tableName: 'fare',
    icon: 'ticket',
    addable: true,
    title: 'Edit fares',
    label: 'Fares'
  }
]
