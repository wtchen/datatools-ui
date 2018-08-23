// @flow

import UserPermissions from '../common/user/UserPermissions'
import UserSubscriptions from '../common/user/UserSubscriptions'

import type {
  Alert,
  FetchStatus,
  GtfsStop,
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
  isFetching: boolean,
  data: any,
  userQueryString: ?string
}

export type UsersState = {
  isFetching: boolean,
  data: any,
  userCount: number,
  page: number,
  perPage: number,
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
  fetched: boolean,
  isFetching: boolean,
  all: Array<Alert>,
  entities: Array<any>,
  filter: {
    searchText: ?string,
    filter: string
  },
  counts: any
}

export type AlertsState = ActiveState & AlertsReducerState

/**
 * ----------------------------
 * Editor Reducers
 * ----------------------------
 */

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
  lock: any,
  tables: {
    agency: Array<any>,
    routes: Array<any>,
    stops: Array<any>
  },
  sort: {
    key: string,
    direction: any
  },
  status: {
    savePending?: boolean,
    saveSuccessful?: boolean,
    creatingSnapshot?: boolean
  }
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
  intersectionStep: number,
  onMapClick: any,
  patternSegments: any,
  showStops: boolean,
  showTooltips: boolean,
  hideStopHandles: boolean,
  stopInterval: number
}

export type MapState = {
  zoom: any,
  bounds: any,
  target: any
}

export type TimetableState = {
  +status: {
    +fetched: boolean,
    +error: boolean,
    +fetching: boolean,
    scheduleId?: string
  },
  +activeCell: ?string,
  +columns: Array<any>,
  +trips: Array<any>,
  +edited: Array<any>,
  +selected: Array<any>,
  +hideDepartureTimes: boolean,
  +offset: any,
  +scrollIndexes: {
    +scrollToColumn: number,
    +scrollToRow: number
  }
}

export type EditorState = {
  data: DataState,
  editSettings: {
    future: Array<EditSettingsState>,
    present: EditSettingsState,
    index: number,
    limit: number,
    past: Array<EditSettingsState>
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
  showArrivals: boolean,
  showAllRoutesOnMap: boolean,
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
  route_id: string,
  route_name: string,
  pattern_id: string,
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
    route_id: string,
    route_short_name: string,
    route_long_name: string,
    route_desc: ?string,
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
  feedVersionId: any,
  timestamp: any,
  tableData: any,
  validation: any,
  gtfsEntityLookup: any,
  visibility: string,
  currentPage: number,
  pageCount: number,
  recordsPerPage: number
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
  message: ?string,
  modal: ?{
    title: string,
    body: string,
    action: string,
    detail: string
  },
  jobMonitor: {
    timer: ?IntervalID,
    visible: boolean,
    jobs: Array<ServerJob>,
    retired: Array<ServerJob>
  }
}

export type UiState = {
  sidebarExpanded: boolean,
  hideTutorial: boolean
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
  fetched: boolean,
  isFetching: boolean,
  all: Array<any>,
  entities: Array<any>,
  filter: {
    searchText: any,
    filter: string
  },
  counts: any
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
