// @flow

import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {middleware as fetchMiddleware} from '@conveyal/woonerf/fetch'
import clone from 'lodash/cloneDeep'
import {browserHistory} from 'react-router'
import {routerMiddleware, routerReducer as routing} from 'react-router-redux'
import {applyMiddleware, combineReducers, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'

import admin from './admin/reducers'
import {defaultState as defaultAdminOrganizationsState} from './admin/reducers/organizations'
import {defaultState as defaultAdminUsersState} from './admin/reducers/users'
import alerts from './alerts/reducers'
import {defaultState as defaultAlertsActiveState} from './alerts/reducers/active'
import {defaultState as defaultAlertsAlertsState} from './alerts/reducers/alerts'
import editor from './editor/reducers'
import {defaultState as defaultEditorDataState} from './editor/reducers/data'
import {defaultState as defaultEditorMapState} from './editor/reducers/mapState'
import {defaultState as defaultEditorSettingsState} from './editor/reducers/settings'
import {defaultState as defaultEditorTimetableState} from './editor/reducers/timetable'
import gtfs from './gtfs/reducers'
import {defaultState as defaultGtfsFilterState} from './gtfs/reducers/filter'
import {defaultState as defaultGtfsPatternState} from './gtfs/reducers/patterns'
import {defaultState as defaultGtfsRoutesState} from './gtfs/reducers/routes'
import {defaultState as defaultGtfsShapesState} from './gtfs/reducers/shapes'
import {defaultState as defaultGtfsStopsState} from './gtfs/reducers/stops'
import {defaultState as defaultGtfsTimetablesState} from './gtfs/reducers/timetables'
import {defaultState as defaultGtfsValidationState} from './gtfs/reducers/validation'
import * as gtfsPlusReducers from './gtfsplus/reducers'
import {defaultState as defaultGtfsPlusState} from './gtfsplus/reducers/gtfsplus'
import * as managerReducers from './manager/reducers'
import {defaultState as defaultManagerLanguagesState} from './manager/reducers/languages'
import {defaultState as defaultManagerProjectsState} from './manager/reducers/projects'
import {defaultState as defaultManagerStatusState} from './manager/reducers/status'
import {defaultState as defaultManagerUiState} from './manager/reducers/ui'
import {defaultState as defaultManagerUserState} from './manager/reducers/user'
import signs from './signs/reducers'
import {defaultState as defaultSignActiveState} from './signs/reducers/active'
import {defaultState as defaultSignSignsState} from './signs/reducers/signs'
import type {AppState} from './types/reducers'

const defaultManagerState = {
  languages: defaultManagerLanguagesState,
  projects: defaultManagerProjectsState,
  status: defaultManagerStatusState,
  ui: defaultManagerUiState,
  user: defaultManagerUserState
}

/**
 * Returns a cloned version of the initial load state of the redux store.
 */
export function getMockInitialState(): AppState {
  return clone({
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
  })
}

/**
 * Returns a cloned version of the state or the redux store with a feed loaded
 * for editing in the editor.
 */
export function getMockEditorState (): AppState {
  const editorState = getMockInitialState()
  return clone(editorState)
}

/**
 * Creates a new store that has reducers that will update state.
 */
export function makeMockStore (initialState: AppState = getMockInitialState()) {
  return createStore(
    // $FlowFixMe not sure why this is giving a flow error
    combineReducers({
      routing,
      ...{
        ...managerReducers,
        admin,
        alerts,
        signs,
        ...gtfsPlusReducers,
        editor,
        gtfs
      }
    }),
    initialState,
    applyMiddleware(...[
      fetchMiddleware,
      multi,
      promise,
      thunkMiddleware
    ])
  )
}
