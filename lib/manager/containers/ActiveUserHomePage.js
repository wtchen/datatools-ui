// @flow

import {connect} from 'react-redux'

import {logout, onUserHomeMount} from '../actions/user'
import {fetchProjectFeeds} from '../actions/feeds'
import {setVisibilitySearchText, setVisibilityFilter} from '../actions/visibilityFilter'
import UserHomePage from '../components/UserHomePage'

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const {projects, user} = state
  return {
    user,
    projects: projects.all
      ? projects.all.filter(p => p.isCreating ||
        (user.permissions && user.permissions.isApplicationAdmin()) ||
        (user.permissions && user.permissions.hasProject(p.id, p.organizationId)))
      : [],
    project: ownProps.routeParams.projectId && projects.all
      ? projects.all.find(p => p.id === ownProps.routeParams.projectId)
      : null,
    projectId: ownProps.routeParams.projectId,
    visibilityFilter: projects.filter
  }
}

const mapDispatchToProps = {
  fetchProjectFeeds,
  logout,
  onUserHomeMount,
  setVisibilityFilter,
  setVisibilitySearchText
}

const ActiveUserHomePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHomePage)

export default ActiveUserHomePage
