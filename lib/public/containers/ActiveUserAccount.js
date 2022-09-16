// @flow

import { connect } from 'react-redux'

import UserAccount from '../components/UserAccount'
import * as feedsActions from '../../manager/actions/feeds'
import * as deploymentsActions from '../../manager/actions/deployments'
import * as projectsActions from '../../manager/actions/projects'
import * as userActions from '../../manager/actions/user'
import * as visibilityFilterActions from '../../manager/actions/visibilityFilter'
import type { AppState, RouterProps } from '../../types/reducers'

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
  fetchProjectDeployments: deploymentsActions.fetchProjectDeployments,
  fetchProjectFeeds: feedsActions.fetchProjectFeeds,
  fetchProjects: projectsActions.fetchProjects,
  sendPasswordReset: userActions.sendPasswordReset,
  setVisibilitySearchText: visibilityFilterActions.setVisibilitySearchText,
  unsubscribeAll: userActions.unsubscribeAll,
  updateTargetForSubscription: userActions.updateTargetForSubscription,
  updateUserData: userActions.updateUserData
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAccount)
