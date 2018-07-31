// @flow

import type {AdminState} from './admin/reducers'
import type {AlertsState} from './alerts/reducers'
import type {EditorState} from './editor/reducers'
import type {GtfsState} from './gtfs/reducers'
import type {GtfsPlusStates} from './gtfsplus/reducers'
import type {ManagerStates} from './manager/reducers'
import type {SignsState} from './signs/reducers'
import type UserPermissions from './common/user/UserPermissions'

export type AppState = {
  admin: AdminState,
  alerts: AlertsState,
  signs: SignsState,
  editor: EditorState,
  gtfs: GtfsState,
  routing: any // react-router state
} & ManagerStates & GtfsPlusStates

export type Agency = {
  agencyBrandingUrl: string,
  agencyFareUrl: string,
  agencyId: string,
  email: string,
  feedId: string,
  id: string,
  lang: string,
  name: string,
  phone: string,
  timezone: string,
  url: string
}

export type RtdEntity = {
  AgencyId: string,
  AlertId: number,
  EditedBy: string,
  EditedDate: string,
  Id: number,
  RouteId: ?string,
  RouteShortName: ?string,
  RouteType: ?number,
  ServiceAlertTrips: Array<any>,
  StopCode: ?string,
  StopId: ?string,
  TripId: ?string
}

export type RtdAlert = {
  Id: number,
  HeaderText: string,
  DescriptionText: string,
  DescriptionText: string,
  Cause: string,
  Effect: string,
  EditedBy: string,
  EditedDate: string,
  Url: string,
  StartDateTime: number,
  EndDateTime: number,
  Published: string,
  ServiceAlertEntities: Array<RtdEntity>
}

export type Bounds = {
  east: number,
  north: number,
  south: number,
  west: number
}

export type createAction = {
  payload: any,
  type: string
}

export type dispatchFn = any => Promise<any>
export type getStateFn = () => AppState
export type ThunkAction = (dispatch: dispatchFn, getState: getStateFn) => any
export type Action = {type: string, payload: any}

export type Route = {
  agencyId: string,
  feedId: string,
  gtfsRouteId: string,
  gtfsRouteType: string,
  id: ?string,
  numberOfTrips?: number,
  publicly_visible: string,
  routeBrandingUrl: string,
  routeColor: string,
  routeDesc: string,
  routeLongName: ?string,
  routeShortName: ?string,
  routeTextColor: string,
  routeUrl: string,
  status: string,
  wheelchairBoarding: string
}

export type Calendar = {|
  description: string,
  endDate: string,
  feedId: string,
  friday: boolean,
  gtfsServiceId: string,
  id: string,
  monday: boolean,
  numberOfTrips: number,
  routes: Array<Route>,
  saturday: boolean,
  startDate: string,
  sunday: boolean,
  thursday: boolean,
  tuesday: boolean,
  wednesday: boolean
|}

export type Coordinate = [number, number]

export type Coordinates = Array<Coordinate>

export type GeoJsonPoint = {
  bbox?: Array<number>,
  crs?: { type: string, properties: mixed },
  geometry: {
    bbox?: Array<number>,
    coordinates: Coordinate,
    crs?: { type: string, properties: mixed },
    type: 'Point'
  },
  type: 'Feature'
}

export type ControlPoint = {
  distance: number,
  hidden?: boolean,
  id: string | number,
  point: GeoJsonPoint,
  // FIXME: fields from ShapePoint
  shapeDistTraveled?: number,
  shapePtSequence: number,
  pointType: number,
  stopId?: string
}

type DatatoolsSettings = {
  client_id: string,
  sidebarExpanded: boolean,
  editor: {
    map_id: string
  },
  hideTutorial: boolean
}

export type Fare = {
  currencyType: string,
  description: string,
  fare_rules: Array<Object>,
  feedId: string,
  gtfsFareId: string,
  id: string,
  paymentMethod: string,
  price: number,
  transfers: number,
  transferDuration: number
}

export type Feed = {
  id: string,
  name: string,
  latestValidation?: {
    bounds: Bounds
  },
  publishedVersionId: string
}

export type FeedVersion = {
  id: string,
  isCreating: boolean,
  name: string,
  feedLoadResult: any,
  feedSourceId: string,
  feedSource: Feed,
  validationResult: {
    endDate: string,
    startDate: string
  }
}

type FeedInfo = {
  id: string
}

export type FeedWithValidation = {
  latestValidation: {
    bounds: Bounds
  }
}

export type Field = {
  adminOnly: boolean,
  columnWidth: number,
  datatools: boolean,
  displayName: string,
  inputType: string,
  name: string,
  options?: Array<{text: string, value: string}>,
  required: boolean
}

export type GeoJsonLinestring = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: Coordinates
  }
}

export type PatternStop = {
  defaultDwellTime: number,
  defaultTravelTime: number,
  shapeDistTraveled: ?number,
  dropOffType: number,
  pickupType: number,
  stopSequence: number,
  timepoint: ?number,
  stopId: string,
  stop_lat?: number,
  stop_lon?: number,
  id: string | number
}

export type ShapePoint = {
  // Shape point ID and shape ID are optional because the backend will
  // auto-generate one them on insert.
  id?: number,
  shapeId?: string,
  shapePtLat: number,
  shapePtLon: number,
  shapePtSequence: number,
  shapeDistTraveled: number,
  pointType: number
}

export type Pattern = {|
  id: string,
  patternStops: Array<PatternStop>,
  shape: {
    coordinates: Coordinates
  },
  useFrequency: boolean
|}

export type GtfsAgency = {|
  agency_id: string,
  agency_branding_url: string,
  agency_email: string,
  agency_fare_url: string,
  agency_lang: string,
  agency_name: string,
  agency_phone: string,
  agency_timezone: string,
  agency_url: string,
  feedId: string,
  id: string
|}

export type GtfsCalendar = {
  description: string,
  end_date: string,
  feedId: string,
  friday: number,
  id: string,
  monday: number,
  numberOfTrips: number,
  routes: Array<Route>,
  saturday: number,
  service_id: string,
  start_date: string,
  sunday: number,
  thursday: number,
  tuesday: number,
  wednesday: number
}

export type GtfsFare = {|
  currency_type: string,
  description: string,
  fare_id: string,
  fare_rules: Array<Object>,
  feedId: string,
  id: string,
  payment_method: string,
  price: number,
  transfers: number,
  transfer_duration: number
|}

export type GtfsPlusField = {
  name: string,
  required: boolean,
  inputType: any,
  columnWidth: number,
  helpContent: string
}

export type GtfsPlusTable = {
  id: string,
  name: string,
  helpContent: string,
  fields: Array<GtfsPlusField>
}

export type GtfsRoute = {|
  agency?: Agency,
  agency_id: string,
  feedId: string,
  id: ?string,
  numberOfTrips: number,
  publicly_visible: string,
  route_branding_url: string,
  route_color: string,
  route_desc: string,
  route_id: string,
  route_long_name: ?string,
  route_short_name: ?string,
  route_text_color: string,
  route_type: string,
  route_url: string,
  status: string,
  wheelchair_accessible: string,
  shape?: {
    coordinates: Coordinates
  },
  tripPatterns?: Array<Pattern>
|}

export type GtfsStop = {|
  agency?: Agency,
  dropOffType?: ?number,
  id?: ?string,
  location_type?: ?string,
  parent_station?: ?string,
  pickupType?: ?number,
  stop_code?: ?string,
  stop_desc?: string,
  stop_id: string,
  stop_lat: number,
  stop_lon: number,
  stop_name: string,
  stop_timezone?: ?string,
  stop_url?: ?string,
  stopId?: string,
  wheelchair_boarding?: ?string,
  zone_id?: ?string
|}

export type LatLng = {
  lat: number,
  lng: number
}

export type Profile = {
  user_metadata: {
    datatools: Array<DatatoolsSettings>
  }
}

export type Project = {
  feedSources: Array<Feed>,
  id: string,
  name: string,
  organizationId: string
}

type ReactSelectOption = {
  label: string,
  value: string
}

export type ReactSelectOptions = Array<ReactSelectOption>

export type ScheduleException = {|
  dates: Array<string>,
  exemplar: number,
  feedId: string,
  id: string,
  isCreating: boolean
|}

export type EditorTableData = {
  agency: Array<GtfsAgency>,
  feedinfo: FeedInfo,
  route: Array<GtfsRoute>,
  scheduleexception?: Array<ScheduleException>
}

export type ServiceCalendar = {|
  id: string,
  description: string,
  service_id: string
|}

export type Entity = ScheduleException |
  GtfsAgency |
  GtfsFare |
  GtfsRoute |
  ServiceCalendar |
  GtfsStop |
  Pattern

export type Sign = {
  id: string,
  title: string,
  editedBy: string,
  editedDate: string,
  published: boolean,
  affectedEntities: Array<Entity>
}

export type Stop = {
  dropOffType?: ?number,
  feedId: string,
  gtfsStopId: string,
  id?: ?string,
  lat: number,
  locationType?: ?string,
  lon: number,
  parentStation?: ?string,
  pickupType?: ?number,
  stopCode?: ?string,
  stopDesc?: string,
  stopName: string,
  stopTimezone?: ?string,
  stopUrl?: ?string,
  wheelchairBoarding?: ?string,
  zoneId?: ?string
}

export type TimetableColumn = {
  name?: string,
  width: number,
  key: string,
  type: string,
  placeholder: string
}

export type StopTime = {
  stopId: string,
  stopSequence: number,
  arrivalTime: number,
  departureTime: number,
  stopHeadsign: string,
  shape_dist_traveled: number
}

export type Trip = {
  tripId: string,
  stopTimes: Array<StopTime>,
  useFrequency: boolean
}

export type UserProfile = {
  user_id: string,
  app_metadata: any,
  user_metadata: any,
  email: string,
  nickname: string,
  picture: string,
  name: string
}

export type User = {
  permissions: UserPermissions,
  profile: UserProfile,
  token: string
}

export type RecentActivity = {
  date: number,
  feedVersionIndex: number,
  feedVersionName: string,
  feedSourceId: string,
  type: string,
  feedSourceName: string,
  projectName: string,
  projectId: string,
  body: string,
  userName: string
}

type Zones = {
  [zoneId: string]: Array<Stop>
}

export type ZoneInfo = {
  zones: Zones,
  zoneOptions: ReactSelectOptions
}

export type AlertEntity = {
  id: number,
  agency: ?Feed,
  type: ?string,
  route_id?: ?string,
  stop_id?: ?string,
  mode?: ?any
}

export type Alert = {
  id: number,
  affectedEntities: Array<any>,
  description: string,
  end: number,
  published: boolean,
  start: number,
  title: string
}

export type ServerJob = {
  jobId: string,
  type: string,
  feedSourceId: ?string,
  snapshot: ?any,
  project: ?any,
  deploymentId: ?string
}
