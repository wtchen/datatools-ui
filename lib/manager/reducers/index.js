// @flow

import type {LanguagesState} from './languages'
import type {ProjectsState} from './projects'
import type {StatusState} from './status'
import type {UiState} from './ui'
import type {UserState} from './user'

export type ManagerStates = {
  languages: LanguagesState,
  projects: ProjectsState,
  status: StatusState,
  ui: UiState,
  user: UserState
}

module.exports = {
  languages: require('./languages'),
  projects: require('./projects'),
  status: require('./status'),
  ui: require('./ui'),
  user: require('./user')
}
