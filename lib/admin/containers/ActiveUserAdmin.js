// @flow

import {connect} from 'react-redux'

import UserAdmin from '../components/UserAdmin'
import {
  createUser,
  deleteUser,
  fetchUsers,
  setUserPage,
  setUserQueryString
} from '../actions/admin'
import {
  createOrganization,
  deleteOrganization,
  fetchOrganizations,
  updateOrganization
} from '../actions/organizations'
import {updateUserData} from '../../manager/actions/user'
import {fetchProjects} from '../../manager/actions/projects'
import {fetchProjectFeeds} from '../../manager/actions/feeds'

import type {AppState, DefaultContainerProps} from '../../types/reducers'

const mapStateToProps = (state: AppState, ownProps: DefaultContainerProps) => {
  return {
    projects: state.projects.all,
    user: state.user,
    users: state.admin.users,
    organizations: state.admin.organizations,
    activeComponent: ownProps.routeParams.subpage
  }
}

const mapDispatchToProps = {
  createOrganization,
  createUser,
  deleteOrganization,
  deleteUser,
  fetchOrganizations,
  fetchProjectFeeds,
  fetchProjects,
  fetchUsers,
  setUserPage,
  setUserQueryString,
  updateOrganization,
  updateUserData
}

const ActiveUserAdmin = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAdmin)

export default ActiveUserAdmin
