// @flow

import { combineReducers } from 'redux'

import filter from './filter'
import feed from './feed'
import patterns from './patterns'
import routes from './routes'
import services from './services'
import stops from './stops'
import timetables from './timetables'
import validation from './validation'

export default combineReducers({
  filter,
  feed,
  patterns,
  routes,
  services,
  stops,
  timetables,
  validation
})
