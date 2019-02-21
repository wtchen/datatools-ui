// @flow

import {connect} from 'react-redux'

import {setVisibilitySearchText} from '../actions/visibilityFilter'
import {deployPublic, onProjectViewerMount} from '../actions/projects'
import {createFeedSource} from '../actions/feeds'
import {fetchProjectDeployments} from '../actions/deployments'
import ProjectViewer from '../components/ProjectViewer'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {user} = state
  const {all, filter: visibilityFilter, isFetching} = state.projects
  const {
    projectId,
    subpage: activeComponent,
    subsubpage: activeSubComponent
  } = ownProps.routeParams
  const project = all ? all.find(p => p.id === projectId) : null
  return {
    project,
    projectId,
    visibilityFilter,
    activeComponent,
    activeSubComponent,
    user,
    isFetching
  }
}

const mapDispatchToProps = {
  createFeedSource,
  deployPublic,
  fetchProjectDeployments,
  onProjectViewerMount,
  setVisibilitySearchText
}

const ActiveProjectViewer = connect(mapStateToProps, mapDispatchToProps)(
  ProjectViewer
)

export default ActiveProjectViewer
