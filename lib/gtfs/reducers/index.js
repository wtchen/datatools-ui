// @flow

import { combineReducers } from 'redux'

import filter from './filter'
import feed from './feed'
import patterns from './patterns'
import routes from './routes'
import stops from './stops'
import timetables from './timetables'
import validation from './validation'

import type {FeedState} from './feed'
import type {FilterState} from './filter'
import type {PatternsState} from './patterns'
import type {RoutesState} from './routes'
import type {StopsState} from './stops'
import type {TimetablesState} from './timetables'
import type {ValidationState} from './validation'

export type GtfsState = {
  filter: FilterState,
  feed: FeedState,
  patterns: PatternsState,
  routes: RoutesState,
  stops: StopsState,
  timetables: TimetablesState,
  validation: ValidationState
}

export default combineReducers({
  filter,
  feed,
  patterns,
  routes,
  stops,
  timetables,
  validation
})
