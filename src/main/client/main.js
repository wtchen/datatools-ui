import 'babel-polyfill'
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

const lang = [
  require('../../../i18n/english.yml'),
  require('../../../i18n/espanol.yml'),
  require('../../../i18n/francais.yml')
]

// is an array containing all the matching modules
config.messages = {}
config.messages.all = lang
const languageId = window.localStorage.getItem('lang')
? window.localStorage.getItem('lang')
: navigator.language || navigator.userLanguage

config.messages.active = lang.find(l => l.id === languageId) || lang.find(l => l.id === 'en-US')

// console.log('config', config)
window.DT_CONFIG = config

import * as managerReducers from './manager/reducers'
import admin from './admin/reducers'
import alerts from './alerts/reducers'
import signs from './signs/reducers'

import * as gtfsPlusReducers from './gtfsplus/reducers'
import editor from './editor/reducers'
import gtfs from './gtfs/reducers'

const logger = createLogger({duration: true, collapsed: true})
const store = createStore(
combineReducers({
  ...managerReducers,
  admin,
  alerts,
  signs,
  ...gtfsPlusReducers,
  editor,
  // ...reportReducers,
  routing: routerReducer,
  gtfs
}),
applyMiddleware(thunkMiddleware, logger)
)

// console.log('initial store', store.getState())

const appHistory = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <App history={appHistory} />
  </Provider>,
document.getElementById('main'))
