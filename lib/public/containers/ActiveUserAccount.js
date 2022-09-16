// @flow

import { connect } from 'react-redux'

import UserAccount from '../components/UserAccount'
import { fetchProjectDeployments } from '../../manager/actions/deployments'
import { fetchProjectFeeds } from '../../manager/actions/feeds'
import { fetchProjects } from '../../manager/actions/projects'
import {
  updateUserData,
  updateTargetForSubscription,
  unsubscribeAll
} from '../../manager/actions/user'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const { projects, status, user } = state
  const { appInfo } = status
  const { licensing } = (appInfo && appInfo.config.modules) || {}
  const { projectId, subpage } = ownProps.routeParams
  return {
    accountTypes: licensing && licensing.enabled && licensing.account_types,
    activeComponent: subpage,
    projectId,
    projects: projects.all,
    user,
    visibilitySearchText: projects.filter.searchText
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
