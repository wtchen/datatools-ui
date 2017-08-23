// @flow

export type Agency = {
  id: string
}

export type Alert = {
  end: string,
  published: boolean,
  start: string
}

export type Bounds = {
  east: number,
  north: number,
  south: number,
  west: number
}

type Point = [number, number]

export type ControlPoint = {
  distance: number,
  id: string,
  permanent: boolean,
  point: Point
}

export type Feed = {
  id: string,
  latestValidation?: {
    bounds: Bounds
  }
}

export type FeedWithValidation = {
  latestValidation: {
    bounds: Bounds
  }
}

type DatatoolsSettings = {
  client_id: string,
  sidebarExpanded: boolean,
  editor: {
    map_id: string
  },
  hideTutorial: boolean
}

export type Stop = {
  agency: ?Agency,
  id: string,
  gtfsStopId: string,
  shapeDistTraveled: number,
  stop_code: string,
  stop_id: string,
  stop_lat: number,
  stop_lon: number,
  stop_name: string,
  stopId: string,
  zone_id: string
}

export type Pattern = {
  patternStops: Array<Stop>,
  shape: {
    coordinates: Array<Point>
  }
}

export type Profile = {
  user_metadata: {
    datatools: Array<DatatoolsSettings>
  }
}

export type Project = {
  feedSources: Array<Feed>,
  id: string,
  organizationId: string
}

export type Route = {
  agency: ?Agency,
  id: string,
  route_id: string,
  route_long_name: ?string,
  route_short_name: ?string,
  shape: {
    coordinates: Array<Point>
  },
  tripPatterns: Array<Pattern>
}

type ReactSelectOption = {
  label: string,
  value: string
}

export type ReactSelectOptions = Array<ReactSelectOption>

export type ServiceCalendar = {
  id: string,
  description: string,
  service_id: string
}

export type StopTime = {
  departureTime: number
}

export type TimetableColumn = {
  name?: string,
  width: number,
  key: string,
  type: string,
  placeholder: string
}

export type Trip = {
  stopTimes: Array<StopTime>,
  useFrequency: boolean
}

export type Entity = Agency | Route | ServiceCalendar | Stop

export type User = {
  permissions: {
    hasFeedPermission: Function
  }
}

type Zones = {
  [zoneId: string]: Array<Stop>
}

export type ZoneInfo = {
  zones: Zones,
  zoneOptions: ReactSelectOptions
}
