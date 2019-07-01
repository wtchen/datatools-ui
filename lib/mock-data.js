// @flow

import {defaultState as defaultAdminOrganizationsState} from './admin/reducers/organizations'
import {defaultState as defaultAdminUsersState} from './admin/reducers/users'
import {defaultState as defaultAlertsActiveState} from './alerts/reducers/active'
import {defaultState as defaultAlertsAlertsState} from './alerts/reducers/alerts'
import {defaultState as defaultEditorDataState} from './editor/reducers/data'
import {defaultState as defaultEditorMapState} from './editor/reducers/mapState'
import {defaultState as defaultEditorSettingsState} from './editor/reducers/settings'
import {defaultState as defaultEditorTimetableState} from './editor/reducers/timetable'
import {defaultState as defaultGtfsFilterState} from './gtfs/reducers/filter'
import {defaultState as defaultGtfsPatternState} from './gtfs/reducers/patterns'
import {defaultState as defaultGtfsRoutesState} from './gtfs/reducers/routes'
import {defaultState as defaultGtfsShapesState} from './gtfs/reducers/shapes'
import {defaultState as defaultGtfsStopsState} from './gtfs/reducers/stops'
import {defaultState as defaultGtfsPlusState} from './gtfsplus/reducers/gtfsplus'
import {defaultState as defaultGtfsTimetablesState} from './gtfs/reducers/timetables'
import {defaultState as defaultGtfsValidationState} from './gtfs/reducers/validation'
import {defaultState as defaultManagerLanguagesState} from './manager/reducers/languages'
import {defaultState as defaultManagerProjectsState} from './manager/reducers/projects'
import {defaultState as defaultManagerStatusState} from './manager/reducers/status'
import {defaultState as defaultManagerUiState} from './manager/reducers/ui'
import {defaultState as defaultManagerUserState} from './manager/reducers/user'
import {defaultState as defaultSignActiveState} from './signs/reducers/active'
import {defaultState as defaultSignSignsState} from './signs/reducers/signs'
import type {AppState} from './types/reducers'

export const mockTripWithoutStopTimes = {
  bikes_allowed: null,
  blockId: '1',
  directionId: 0,
  frequencies: [],
  id: 3,
  pattern_id: '1',
  route_id: 'GL',
  service_id: 'GL-1',
  shape_id: '19',
  stopTimes: [],
  tripHeadsign: 'Walla Walla',
  tripId: 'test-trip-id-1',
  tripShortName: null,
  wheelchair_accessible: null
}

const defaultManagerState = {
  languages: defaultManagerLanguagesState,
  projects: defaultManagerProjectsState,
  status: defaultManagerStatusState,
  ui: defaultManagerUiState,
  user: defaultManagerUserState
}

export const mockInitialState: AppState = {
  admin: {
    organizations: defaultAdminOrganizationsState,
    users: defaultAdminUsersState
  },
  alerts: {
    ...defaultAlertsActiveState,
    ...defaultAlertsAlertsState
  },
  ...defaultManagerState,
  editor: {
    data: defaultEditorDataState,
    // The editSettings state below represents the default state of redux-undo
    // which this reducer uses.
    editSettings: {
      future: [],
      present: defaultEditorSettingsState,
      index: 0,
      limit: 1,
      past: []
    },
    mapState: defaultEditorMapState,
    timetable: defaultEditorTimetableState
  },
  gtfs: {
    filter: defaultGtfsFilterState,
    patterns: defaultGtfsPatternState,
    routes: defaultGtfsRoutesState,
    shapes: defaultGtfsShapesState,
    stops: defaultGtfsStopsState,
    timetables: defaultGtfsTimetablesState,
    validation: defaultGtfsValidationState
  },
  gtfsplus: defaultGtfsPlusState,
  routing: {}, // react-router state
  signs: {
    ...defaultSignActiveState,
    ...defaultSignSignsState
  }
}
