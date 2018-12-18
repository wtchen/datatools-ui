// @flow

import { connect } from 'react-redux'

import PublicFeedSourceViewer from '../components/PublicFeedSourceViewer'
import {
  fetchFeedSourceAndProject,
  updateFeedSource,
  runFetchFeed
} from '../../manager/actions/feeds'
import { fetchFeedVersions, uploadFeed } from '../../manager/actions/versions'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const feedSourceId = ownProps.routeParams.feedSourceId
  const user = state.user
  // find the containing project
  const project = state.projects.all
    ? state.projects.all.find(p => {
      if (!p.feedSources) return false
      return (p.feedSources.findIndex(fs => fs.id === feedSourceId) !== -1)
    })
    : null

  let feedSource
  if (project && project.feedSources) {
    feedSource = project.feedSources.find(fs => fs.id === feedSourceId)
  }

  return {
    feedSource,
    project,
    user
  }
}

const mapDispatchToProps = {
  fetchFeedSourceAndProject,
  fetchFeedVersions,
  runFetchFeed,
  updateFeedSource,
  uploadFeed
}

const ActivePublicFeedSourceViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicFeedSourceViewer)

export default ActivePublicFeedSourceViewer
