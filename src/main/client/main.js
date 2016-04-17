import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { browserHistory, hashHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { checkExistingLogin } from './manager/actions/user'

import App from './common/containers/App'

import config from 'json!yaml!../../../config.yml'

if(config.modules.gtfsplus && config.modules.gtfsplus.enabled) {
  config.modules.gtfsplus.spec = require('json!yaml!../../../gtfsplus.yml')
}
console.log('config', config)
window.DT_CONFIG = config



import * as managerReducers from './manager/reducers'
import * as adminReducers from './admin/reducers'
import * as alertsReducers from './alerts/reducers'
import * as signsReducers from './signs/reducers'

import * as gtfsPlusReducers from './gtfsplus/reducers'
import * as gtfsReducers from './gtfs/reducers'

const store = createStore(
  combineReducers({
    ...managerReducers,
    ...adminReducers,
    ...alertsReducers,
    ...signsReducers,
    ...gtfsPlusReducers,
    ...gtfsReducers,
    routing: routerReducer
  }),
  applyMiddleware(thunkMiddleware)
)

console.log('initial store', store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
let unsubscribe = store.subscribe(() =>
  console.log('store updated', store.getState())
)

const appHistory = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <App history={appHistory} />
  </Provider>,
  document.getElementById('main'))
