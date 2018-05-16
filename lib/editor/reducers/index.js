import { combineReducers } from 'redux'
import {handleActions} from 'redux-actions'
import undoable, {includeAction} from 'redux-undo'

import data from './data'
import * as settings from './settings'
import * as mapState from './mapState'
import timetable from './timetable'

export default combineReducers({
  data,
  editSettings: undoable(
    handleActions(settings.reducers, settings.defaultState),
    { undoType: 'UNDO_TRIP_PATTERN_EDITS',
      filter: includeAction([
        // 'CONTROL_POINT_DRAG_START_OR_END',
        'RESNAP_STOPS',
        // 'RESET_ACTIVE_GTFS_ENTITY',
        // 'SAVED_TRIP_PATTERN',
        'SETTING_ACTIVE_GTFS_ENTITY',
        // 'TOGGLE_PATTERN_EDITING',
        // 'UNDO_TRIP_PATTERN_EDITS',
        // 'UPDATE_ACTIVE_GTFS_ENTITY',
        'UPDATE_PATTERN_GEOMETRY',
        // 'UPDATE_EDIT_SETTING',
        'UPDATE_PATTERN_COORDINATES'
      ]),
      // jumpToPastType: 'SETTING_ACTIVE_GTFS_ENTITY', // FIXME
      clearHistoryType: ['TOGGLE_PATTERN_EDITING', 'SAVED_TRIP_PATTERN'],
      initialState: settings.defaultState
    }
  ),
  mapState: handleActions(mapState.reducers, mapState.defaultState),
  timetable
})
