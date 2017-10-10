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
