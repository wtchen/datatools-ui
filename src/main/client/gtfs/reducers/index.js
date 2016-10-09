import { combineReducers } from 'redux'

import filter from './filter'
import feed from './feed'
// import pageLayout from './pageLayout'
import patterns from './patterns'
import routes from './routes'
import stops from './stops'

export default combineReducers({
  filter,
  feed,
  // pageLayout,
  patterns,
  routes,
  stops
})
