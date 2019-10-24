// @flow

export default [
  {
    type: 'manage-feed',
    name: 'Manage Feed Configuration',
    feedSpecific: true
  },
  {
    type: 'edit-gtfs',
    name: 'Edit GTFS Feeds',
    feedSpecific: true
  },
  {
    type: 'approve-gtfs',
    name: 'Approve GTFS Feeds',
    feedSpecific: true
  },
  {
    type: 'edit-alert',
    name: 'Edit GTFS-RT Alerts',
    feedSpecific: true,
    module: 'alerts'
  },
  {
    type: 'approve-alert',
    name: 'Approve GTFS-RT Alerts',
    feedSpecific: true,
    module: 'alerts'
  }
]
