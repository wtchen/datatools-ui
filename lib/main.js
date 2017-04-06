import 'babel-polyfill'
import mount from '@conveyal/woonerf/mount'

import App from './common/containers/App'
import * as managerReducers from './manager/reducers'
import admin from './admin/reducers'
import alerts from './alerts/reducers'
import signs from './signs/reducers'

import * as gtfsPlusReducers from './gtfsplus/reducers'
import editor from './editor/reducers'
import gtfs from './gtfs/reducers'

const config = JSON.parse(process.env.SETTINGS)
if (config.modules.gtfsplus && config.modules.gtfsplus.enabled) {
  config.modules.gtfsplus.spec = require('../gtfsplus.yml')
}
config.modules.editor.spec = require('../gtfs.yml')

const lang = [
  require('../i18n/english.yml'),
  require('../i18n/espanol.yml'),
  require('../i18n/francais.yml')
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

mount({
  app: App,
  reducers: {
    ...managerReducers,
    admin,
    alerts,
    signs,
    ...gtfsPlusReducers,
    editor,
    gtfs
  }
})
