// @flow

import UserPermissions from '../common/user/UserPermissions'
import UserSubscriptions from '../common/user/UserSubscriptions'

import type {
  Alert,
  FetchStatus,
  GtfsStop,
  Organization,
  Project,
  RecentActivity,
  ServerJob,
  UserProfile
} from './'

type FetchStatusSubState = {
  fetchStatus: FetchStatus
}

/**
 * ----------------------------
 * Admin Reducers
 * ----------------------------
 */
export type OrganizationsState = {
  data: null | Array<Organization>,
  isFetching: boolean
}

export type UsersState = {
  data: any,
  isFetching: boolean,
  page: number,
  perPage: number,
  userCount: number,
  userQueryString: ?string
}

export type AdminState = {
  organizations: OrganizationsState,
  users: UsersState
}

/**
 * ----------------------------
 * Alert Reducers
 * ----------------------------
 */

export type ActiveState = {
  active: any
}

export type AlertsReducerState = {
  all: Array<Alert>,
  counts: any,
  entities: Array<any>,
  fetched: boolean,
  filter: {
    feedId?: string,
    filter: string,
    searchText: ?string,
    sort?: {
      direction: string,
      type: string
    }
  },
  isFetching: boolean
}

export type AlertsState = ActiveState & AlertsReducerState

/**
 * ----------------------------
 * Editor Reducers
 * ----------------------------
 */

type TypeCount = {
  count: number,
  type: string
}

export type TripCounts = {
  pattern_id: Array<TypeCount>,
  route_id: Array<TypeCount>,
  service_id: Array<TypeCount>
}

export type EditorTables = {
  agency: Array<{
    agency_id: string,
    agency_name: string,
    id: number
  }>,
  calendar: Array<{
    description: string,
    id: number,
    service_id: string
  }>,
  fares: Array<{
    fare_id: string,
    id: number,
  }>,
  feed_info: Array<{
    default_route_color: ?any,
    default_route_type: ?any,
    feed_end_date: ?any,
    feed_lang: string,
    feed_publisher_name: string,
    feed_publisher_url: string,
    feed_start_date: ?any,
    feed_version: string,
    id: number
  }>,
  routes: Array<{
    id: number,
    route_id: string,
    route_long_name: string,
    route_short_name: string
  }>,
  schedule_exceptions: Array<{
    id: number,
    name: string
  }>,
  stops: Array<{
    id: number,
    stop_code: string,
    stop_id: string,
    stop_lat: number,
    stop_lon: number,
    stop_name: string,
    zone_id: string
  }>,
  trip_counts: TripCounts
}

export type LockState = {
  feedId?: ?string,
  sessionId?: ?string,
  timer?: ?IntervalID,
  timestamp?: ?string
}

export type DataState = {
  active: {
    component?: string,
    edited?: boolean,
    entity?: any,
    entityId?: number,
    feedSourceId?: string,
    patternEdited?: boolean,
    patternSegment?: number,
    patternStop?: {id: string, index: number},
    subComponent?: string,
    subEntity?: any,
    subEntityId?: number,
    subSubComponent?: string,
    subSubEntityId?: string
  },
  lock: LockState,
  sort: {
    direction: any,
    key: string
  },
  status: {
    creatingSnapshot?: boolean,
    savePending?: boolean,
    saveSuccessful?: boolean
  },
  tables: EditorTables
}

export type EditSettingsState = {
  addStops: boolean,
  afterIntersection: boolean,
  controlPoints: any,
  currentDragId: any,
  distanceFromIntersection: number,
  editGeometry: boolean,
  followStreets: boolean,
  hideInactiveSegments: boolean,
  hideStopHandles: boolean,
  intersectionStep: number,
  onMapClick: any,
  patternSegments: any,
  showStops: boolean,
  showTooltips: boolean,
  stopInterval: number
}

export type MapState = {
  bounds: any,
  target: any,
  zoom: any
}

export type TimetableState = {
  +activeCell: ?string,
  +columns: Array<any>,
  +edited: Array<any>,
  +hideDepartureTimes: boolean,
  +offset: any,
  +scrollIndexes: {
    +scrollToColumn: number,
    +scrollToRow: number
  },
  +selected: Array<number>,
  +status: {
    +error: boolean,
    +fetched: boolean,
    +fetching: boolean,
    scheduleId?: string
  },
  +trips: Array<any>
}

export type EditorState = {
  data: DataState,
  editSettings: {
    future: Array<EditSettingsState>,
    index: number,
    limit: number,
    past: Array<EditSettingsState>,
    present: EditSettingsState
  },
  mapState: MapState,
  timetable: TimetableState
}

/**
 * ----------------------------
 * Gtfs Reducers
 * ----------------------------
 */

export type FeedState = FetchStatusSubState & {
  data: Array<any>
}

export type FilterState = {
  activeFeeds: any,
  dateTimeFilter: {
    date: string,
    from: number,
    to: number
  },
  loadedFeeds: Array<any>,
  map: {
    bounds: [[number, number], [number, number]],
    zoom: number
  },
  patternFilter: ?string,
  permissionFilter: string,
  project: ?string,
  routeFilter: ?string,
  routeLimit: number,
  routeOffset: number,
  showAllRoutesOnMap: boolean,
  showArrivals: boolean,
  timepointFilter: boolean,
  typeFilter: Array<string>,
  version: any
}

export type ValidationPattern = {
  geometry: {
    coordinates: Array<Array<number>>,
    type: string,
  },
  name: string,
  pattern_id: string,
  route_id: string,
  route_name: string,
  shape: Array<{
    lat: number,
    lon: number
  }>,
  stops: Array<{
    stop_id: string
  }>,
  trips: Array<{
    stop_times: Array<{
      arrival_time: number,
      departure_time: number
    }>
  }>
}

export type ValidationStop = {
  location_type: ?number,
  stop_code: ?string,
  stop_desc: ?string,
  stop_id: string,
  stop_lat: number,
  stop_lon: number,
  stop_name: string,
  stop_url: ?string,
  wheelchair_boarding: ?number,
  zone_id: ?string
}

export type PatternsState = FetchStatusSubState & {
  data: {
    patterns: Array<ValidationPattern>,
    stops: Array<ValidationStop>
  }
}

export type RouteDetailsData = {
  numRoutes: number,
  routes: Array<{
    route_desc: ?string,
    route_id: string,
    route_long_name: string,
    route_short_name: string,
    stops: Array<{
      stop_id: string
    }>,
    trips: Array<{
      pattern_id: string,
      stop_times: Array<{
        arrival_time: number,
        departure_time: number
      }>
    }>
  }>
}

export type RouteListItem = {
  route_id: string,
  route_long_name: ?string,
  route_name: string,
  route_short_name: ?string
}

type AllRoutes = Array<RouteListItem>

export type AllRoutesSubState = FetchStatusSubState & {
  data: null | AllRoutes
}

export type RoutesState = {
  allRoutes: AllRoutesSubState,
  routeDetails: FetchStatusSubState & {
    data: null | RouteDetailsData
  }
}

export type ShapesState = FetchStatusSubState & {
  data: Array<any>
}

export type StopsState = FetchStatusSubState & {
  data: Array<GtfsStop>
}

export type TimetableStop = {
  stop_id: string,
  stop_name: string
}

export type TimetablesState = FetchStatusSubState & {
  data: null | {
    feed: ?{
      patterns: Array<{
        stops: Array<TimetableStop>,
        trips: Array<{
          direction_id: number,
          pattern_id: string,
          service_id: string,
          stop_times: Array<{
            arrival_time: ?number,
            departure_time: ?number,
            stop_id: string,
            stop_sequence: number,
            timepoint: ?boolean
          }>,
          trip_headsign: string,
          trip_id: string,
          trip_short_name: ?string
        }>
      }>
    }
  }
}

export type ValidationState = FetchStatusSubState & {
  data: {[string]: any}
}

export type GtfsState = {
  feed: FeedState,
  filter: FilterState,
  patterns: PatternsState,
  routes: RoutesState,
  shapes: ShapesState,
  stops: StopsState,
  timetables: TimetablesState,
  validation: ValidationState
}

/**
 * ----------------------------
 * Gtfs Plus Reducers
 * ----------------------------
 */

export type GtfsPlusReducerState = {
  activeTableId: string,
  currentPage: number,
  feedVersionId: any,
  gtfsEntityLookup: any,
  pageCount: number,
  recordsPerPage: number,
  tableData: any,
  timestamp: any,
  validation: any,
  visibility: string
}

export type GtfsPlusStates = {
  gtfsplus: GtfsPlusReducerState
}

/**
 * ----------------------------
 * Manager Reducers
 * ----------------------------
 */

export type LanguagesState = {
  +active: any,
  +all: any
}

export type ProjectsState = {
  active: any, // FIXME: not sure if this should be (null | string) or (null | Project)
  all: Array<Project>,
  filter: {
    searchText: null | string
  },
  isFetching: boolean
}

export type StatusState = {
  jobMonitor: {
    jobs: Array<ServerJob>,
    retired: Array<ServerJob>,
    timer: ?IntervalID,
    visible: boolean
  },
  message: ?string,
  modal: ?{
    action: string,
    body: string,
    detail: string,
    title: string
  }
}

export type UiState = {
  hideTutorial: boolean,
  sidebarExpanded: boolean
}

export type UserState = {
  +isCheckingLogin: boolean,
  +permissions: ?UserPermissions,
  +profile: ?UserProfile,
  +recentActivity: ?Array<RecentActivity>,
  +redirectOnSuccess: ?boolean,
  +subscriptions: ?UserSubscriptions,
  +token: ?string
}

export type ManagerStates = {
  languages: LanguagesState,
  projects: ProjectsState,
  status: StatusState,
  ui: UiState,
  user: UserState
}

/**
 * ----------------------------
 * Signs Reducers
 * ----------------------------
 */

export type ActiveSign = {
  active: any
}

export type SignsReducerState = {
  all: Array<any>,
  counts: any,
  entities: Array<any>,
  fetched: boolean,
  filter: {
    filter: string,
    searchText: any
  },
  isFetching: boolean
}

export type SignsState = ActiveSign & SignsReducerState

/**
 * ----------------------------
 * All Reducers
 * ----------------------------
 */

export type AppState = {
  admin: AdminState,
  alerts: AlertsState,
  editor: EditorState,
  gtfs: GtfsState,
  routing: any, // react-router state
  signs: SignsState
} & ManagerStates & GtfsPlusStates

/**
 * ----------------------------
 * Redux helpers
 * ----------------------------
 */

export type dispatchFn = any => Promise<any>
export type getStateFn = () => AppState
export type ThunkAction = (dispatch: dispatchFn, getState: getStateFn) => any
