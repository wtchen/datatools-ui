import React from 'react'
import { connect } from 'react-redux'

import UserAccount from '../components/UserAccount'
import { setVisibilitySearchText } from '../../manager/actions/visibilityFilter'
import { fetchProjectsWithPublicFeeds, fetchProjects } from '../../manager/actions/projects'
import { fetchFeedSource, receiveFeedSource } from '../../manager/actions/feeds'
import { updateUserData, fetchUser, updateTargetForSubscription, removeUserSubscription } from '../../manager/actions/user'

const mapStateToProps = (state, ownProps) => {
  return {
    visibilitySearchText: state.projects.filter.searchText,
    projects: state.projects.all,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  // const projectId = ownProps.routeParams.projectId
  return {
    onComponentMount: (initialProps) => {
      if (!initialProps.projects){
        dispatch(fetchProjects())
        .then(() => {
          let subscriptions = initialProps.user.profile.app_metadata.datatools.find(dt => dt.client_id === DT_CONFIG.auth0.client_id).subscriptions
          if (subscriptions) {
            Promise.all(
              subscriptions.map(sub => {
                console.log(sub)
                sub.target.map(target => {
                  console.log('queuing feed source ', target)
                  return (dispatch(fetchFeedSource(target)))
                })
              })
            ).then(results => {
              console.log('got feed sources', results)
            })
          }
        })
      }
      else {
        let subscriptions = initialProps.user.profile.app_metadata.datatools.find(dt => dt.client_id === DT_CONFIG.auth0.client_id).subscriptions
        if (subscriptions) {
          Promise.all(
            subscriptions.map(sub => {
              console.log(sub)
              sub.target.map(target => {
                console.log('queuing feed source ', target)
                return (dispatch(fetchFeedSource(target)))
              })
            })
          ).then(results => {
            console.log('got feed sources', results)
          })
        }
      }

    },
    searchTextChanged: (text) => { dispatch(setVisibilitySearchText(text)) },
    updateUserName: (user, permissions) => { dispatch(updateUserData(user, permissions)) },
    updateUserSubscription: (profile, target, subscriptionType) => { dispatch(updateTargetForSubscription(profile, target, subscriptionType)) },
    removeUserSubscription: (profile, subscriptionType) => { dispatch(removeUserSubscription(profile, subscriptionType)) },
    fetchUser: (user, permissions) => { dispatch(fetchUser(user)) }
  }
}

const ActiveUserAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default ActiveUserAccount
