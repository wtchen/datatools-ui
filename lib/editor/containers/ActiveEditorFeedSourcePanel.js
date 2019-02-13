// @flow

import {connect} from 'react-redux'
import {
  fetchSnapshots,
  restoreSnapshot,
  deleteSnapshot,
  downloadSnapshot,
  createSnapshot
} from '../actions/snapshots.js'
import {createFeedVersionFromSnapshot} from '../../manager/actions/versions'

import EditorFeedSourcePanel from '../components/EditorFeedSourcePanel'

import type {Feed, Project} from '../../types'
import type {AppState} from '../../types/reducers'

export type Props = {
  feedSource: Feed,
  project: Project
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  return {
    user
  }
}

const mapDispatchToProps = {
  createFeedVersionFromSnapshot,
  createSnapshot,
  deleteSnapshot,
  downloadSnapshot,
  fetchSnapshots,
  restoreSnapshot
}

const ActiveEditorFeedSourcePanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorFeedSourcePanel)

export default ActiveEditorFeedSourcePanel
