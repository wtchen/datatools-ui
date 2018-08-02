// @flow

import type {AdminState} from '../admin/reducers'
import type {AlertsState} from '../alerts/reducers'
import type {EditorState} from '../editor/reducers'
import type {GtfsState} from '../gtfs/reducers'
import type {GtfsPlusStates} from '../gtfsplus/reducers'
import type {ManagerStates} from '../manager/reducers'
import type {SignsState} from '../signs/reducers'

export type AppState = {
  admin: AdminState,
  alerts: AlertsState,
  signs: SignsState,
  editor: EditorState,
  gtfs: GtfsState,
  routing: any // react-router state
} & ManagerStates & GtfsPlusStates
