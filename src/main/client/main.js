import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import createLogger from 'redux-logger'

import App from './common/containers/App'

import config from '../../../config.yml'

if (config.modules.gtfsplus && config.modules.gtfsplus.enabled) {
  config.modules.gtfsplus.spec = require('../../../gtfsplus.yml')
}
config.modules.editor.spec = require('../../../gtfs.yml')

var lang = {
  english: require('../../../i18n/english.yml'),
  espanol: require('../../../i18n/espanol.yml'),
  francais: require('../../../i18n/francais.yml')
}

// is an array containing all the matching modules
config.messages = {}
config.messages.all = lang
const languageId = window.localStorage.getItem('lang')
  ? window.localStorage.getItem('lang')
  : navigator.language || navigator.userLanguage

config.messages.active = lang.find(l => l.id === languageId) || lang.find(l => l.id === 'en-US')

console.log('config', config)
window.DT_CONFIG = config

import * as managerReducers from './manager/reducers'
import * as adminReducers from './admin/reducers'
import * as alertsReducers from './alerts/reducers'
import * as signsReducers from './signs/reducers'

import * as gtfsPlusReducers from './gtfsplus/reducers'
import * as editorReducers from './editor/reducers'
import gtfs from './gtfs/reducers'

const logger = createLogger({duration: true, collapsed: true})
const store = createStore(
  combineReducers({
    ...managerReducers,
    ...adminReducers,
    ...alertsReducers,
    ...signsReducers,
    ...gtfsPlusReducers,
    ...editorReducers,
    // ...reportReducers,
    routing: routerReducer,
    gtfs
  }),
  applyMiddleware(thunkMiddleware, logger)
)

console.log('initial store', store.getState())

const appHistory = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <App history={appHistory} />
  </Provider>,
  document.getElementById('main'))
