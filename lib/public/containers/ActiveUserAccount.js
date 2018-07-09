import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import UserAccount from '../components/UserAccount'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import { fetchProjects } from '../../manager/actions/projects'
import { fetchProjectFeeds } from '../../manager/actions/feeds'
import {
  updateUserData,
  updateTargetForSubscription,
  removeUserSubscription,
  unsubscribeAll
} from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    visibilitySearchText: state.projects.filter.searchText,
    projects: state.projects.all,
    user: state.user,
    activeComponent: ownProps.routeParams.subpage,
    projectId: ownProps.routeParams.projectId
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onComponentMount: (initialProps) => {
      if (!ownProps.routeParams.subpage) {
        browserHistory.push('/settings/profile')
      }
      // Get all projects and their contained feeds (for subscription management)
      dispatch(fetchProjects())
        .then((projects) =>
          Promise.all(projects.map(project => dispatch(fetchProjectFeeds(project.id))))
        )
    },
    searchTextChanged: (text) => dispatch(setVisibilitySearchText(text)),
    updateUserName: (user, permissions) => dispatch(updateUserData(user, permissions)),
    updateUserSubscription: (profile, target, subscriptionType) => dispatch(updateTargetForSubscription(profile, target, subscriptionType)),
    unsubscribeAll: (profile, target, subscriptionType) => dispatch(unsubscribeAll(profile)),
    removeUserSubscription: (profile, subscriptionType) => dispatch(removeUserSubscription(profile, subscriptionType))
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default ActiveUserAccount
