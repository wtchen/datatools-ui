// @flow

import { connect } from 'react-redux'

import PublicFeedsViewer from '../components/PublicFeedsViewer'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import { fetchProjectsWithPublicFeeds } from '../../manager/actions/projects'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    visibilitySearchText: state.projects.filter.searchText,
    projects: state.projects.all
  }
}

const mapDispatchToProps = {
  fetchProjectsWithPublicFeeds,
  setVisibilitySearchText
}

const ActivePublicFeedsViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PublicFeedsViewer)

export default ActivePublicFeedsViewer
