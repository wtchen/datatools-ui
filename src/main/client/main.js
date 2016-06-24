import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
// import promise from 'redux-promise'
import createLogger from 'redux-logger'

import { checkExistingLogin } from './manager/actions/user'
import App from './common/containers/App'


import 'react-virtualized/styles.css'

import config from 'json!yaml!../../../config.yml'

if(config.modules.gtfsplus && config.modules.gtfsplus.enabled) {
  config.modules.gtfsplus.spec = require('json!yaml!../../../gtfsplus.yml')
}
config.modules.editor.spec = require('json!yaml!../../../gtfs.yml')

// function to require all lang files in i18n dir
function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
// requires and returns all modules that match
var lang = requireAll(require.context('json!yaml!../../../i18n', true, /.yml/))
// is an array containing all the matching modules
config.messages = {}
config.messages.all = lang
const languageId = localStorage.getItem('lang') ? localStorage.getItem('lang') : navigator.language || navigator.userLanguage
config.messages.active = lang.find(l => l.id === languageId) || lang.find(l => l.id === 'en-US')

console.log('config', config)
window.DT_CONFIG = config



import * as managerReducers from './manager/reducers'
import * as adminReducers from './admin/reducers'
import * as alertsReducers from './alerts/reducers'
import * as signsReducers from './signs/reducers'

import * as gtfsPlusReducers from './gtfsplus/reducers'
import * as editorReducers from './editor/reducers'
import * as gtfsReducers from './gtfs/reducers'

const logger = createLogger({duration: true, collapsed: true})
const store = createStore(
  combineReducers({
    ...managerReducers,
    ...adminReducers,
    ...alertsReducers,
    ...signsReducers,
    ...gtfsPlusReducers,
    ...editorReducers,
    ...gtfsReducers,
    routing: routerReducer
  }),
  applyMiddleware(thunkMiddleware, logger)
)

console.log('initial store', store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
let unsubscribe = store.subscribe(() => {
  // console.log('store updated', store.getState())
})

const appHistory = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <App history={appHistory} />
  </Provider>,
  document.getElementById('main'))
