import { combineReducers } from 'redux'

import data from './data'
import editSettings from './settings'
import mapState from './mapState'
import timetable from './timetable'

export default combineReducers({
  data,
  editSettings,
  mapState,
  timetable
})
