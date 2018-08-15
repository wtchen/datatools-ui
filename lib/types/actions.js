// @flow

import type {DeploymentActions} from '../manager/actions/deployments'
import type {FeedActions} from '../manager/actions/feeds'
import type {LanguageActions} from '../manager/actions/languages'
import type {NoteActions} from '../manager/actions/notes'
import type {ProjectActions} from '../manager/actions/projects'
import type {StatusActions} from '../manager/actions/status'
import type {UiActions} from '../manager/actions/ui'
import type {UserActions} from '../manager/actions/user'

export type Action = DeploymentActions |
  FeedActions |
  LanguageActions |
  NoteActions |
  ProjectActions |
  StatusActions |
  UiActions |
  UserActions
