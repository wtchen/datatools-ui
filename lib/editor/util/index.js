// @flow

import {getConfigProperty} from '../../common/util/config'

import type {
  Feed,
  Pattern,
  GtfsStop,
  Project,
  Trip,
  User,
  ZoneInfo
} from '../../types'

export const CLICK_OPTIONS: Array<string> = [
  'DRAG_HANDLES',
  'ADD_STOP_AT_CLICK',
  'ADD_STOPS_AT_INTERVAL',
  'ADD_STOPS_AT_INTERSECTIONS'
]
export const YEAR_FORMAT: string = 'YYYY-MM-DD'
export const EXCEPTION_EXEMPLARS: any = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
  NO_SERVICE: 7,
  CUSTOM: 8,
  SWAP: 9
}

export function getStopsForPattern (pattern: Pattern, stops: Array<GtfsStop>): Array<GtfsStop> {
  return pattern && pattern.patternStops && stops
    ? pattern.patternStops.map(ps => {
      const foundStop = stops.find(s => s.stop_id === ps.stopId)
      if (!foundStop) throw new Error(`Stop not found for pattern stop: ${JSON.stringify(ps)}`)
      return foundStop
    })
    : []
}

export function sortAndFilterTrips (
  trips: ?Array<Trip>,
  useFrequency: boolean
): Array<Trip> {
  return trips
    ? trips
        .filter(t => t.useFrequency === useFrequency) // filter out based on useFrequency
        .sort((a, b) => {
          // There may be a case where a null value (skipped stop) appears first
          // in the list of stopTimes. In this case, we want to compare on the
          // first stopTime that exists for each pair of trips.
          let aStopTime, bStopTime
          let count = 0
          while (!aStopTime || !bStopTime) {
            aStopTime = a.stopTimes[count]
            bStopTime = b.stopTimes[count]
            count++
          }
          if (!aStopTime.departureTime || !bStopTime.departureTime) {
            return 0
          } else if (aStopTime.departureTime < bStopTime.departureTime) {
            return -1
          } else if (
            aStopTime.departureTime > bStopTime.departureTime
          ) {
            return 1
          }
          return 0
        })
    : []
}

export function getZones (
  stops: ?Array<GtfsStop>,
  activeStop: ?GtfsStop
): ZoneInfo {
  const zones = {}
  if (stops) {
    for (var i = 0; i < stops.length; i++) {
      const stop = stops[i]
      const {zone_id} = stop
      // eslint-disable-next-line camelcase
      if (zone_id) {
        let zone = zones[zone_id]
        if (!zone) {
          zone = []
        }
        zone.push(stop)
        zones[zone_id] = zone
      }
    }
    // add any new zone
    if (activeStop && activeStop.zone_id && !zones[activeStop.zone_id]) {
      const {zone_id} = activeStop
      let zone = zones[zone_id]
      if (!zone) {
        zone = []
      }
      zone.push(activeStop)
      zones[zone_id] = zone
    }
  }
  const zoneOptions = Object.keys(zones).map(key => {
    return {
      value: key,
      label: `${key} zone (${zones[key] ? zones[key].length : 0} stops)`
    }
  })
  return {zones, zoneOptions}
}

// used to select the table from gtfs.yml to be used for
// validating and populating fields in editor (EntityDetails)
export function getEditorTable (component: string) {
  const spec = getConfigProperty('modules.editor.spec')
  if (!spec) {
    throw new Error('Editor spec could not be found!')
  }
  return spec.find(
    t =>
      component === 'fare' ? t.id === 'fare_attributes' : t.id === component
  )
}

export function canApproveGtfs (project: Project, feedSource: Feed, user: User) {
  return (
    project &&
    feedSource &&
    user &&
    !user.permissions.hasFeedPermission(
      project.organizationId,
      project.id,
      feedSource.id,
      'approve-gtfs'
    )
  )
}
