// @flow

import {connect} from 'react-redux'

import UserAccount from '../components/UserAccount'
import {setVisibilitySearchText} from '../../manager/actions/visibilityFilter'
import {fetchProjects} from '../../manager/actions/projects'
import {fetchProjectDeployments} from '../../manager/actions/deployments'
import {fetchProjectFeeds} from '../../manager/actions/feeds'
import {
  updateUserData,
  updateTargetForSubscription,
  unsubscribeAll
} from '../../manager/actions/user'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    visibilitySearchText: state.projects.filter.searchText,
    projects: state.projects.all,
    user: state.user,
    activeComponent: ownProps.routeParams.subpage,
    projectId: ownProps.routeParams.projectId
  }
}

const mapDispatchToProps = {
  fetchProjectDeployments,
  fetchProjectFeeds,
  fetchProjects,
  setVisibilitySearchText,
  unsubscribeAll,
  updateTargetForSubscription,
  updateUserData
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default ActiveUserAccount
