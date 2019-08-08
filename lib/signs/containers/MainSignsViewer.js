// @flow

import {connect} from 'react-redux'

import SignsViewer from '../components/SignsViewer'
import {createSign, fetchRtdSigns} from '../actions/signs'
import {updatePermissionFilter} from '../../gtfs/actions/filter'
import {getAllFeeds, getActiveFeeds} from '../../gtfs/selectors'
import {fetchProjects} from '../../manager/actions/projects'
import {getActiveProject} from '../../manager/selectors'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    activeFeeds: getActiveFeeds(state),
    allFeeds: getAllFeeds(state),
    fetched: state.signs.fetched,
    permissionFilter: state.gtfs.filter.permissionFilter,
    project: getActiveProject(state),
    signs: state.signs.all,
    user: state.user
  }
}

const mapDispatchToProps = {
  createSign,
  fetchProjects,
  fetchRtdSigns,
  updatePermissionFilter
}

const MainSignsViewer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignsViewer)

export default MainSignsViewer
