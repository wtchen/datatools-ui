// @flow

import {connect} from 'react-redux'

import UserAdmin from '../components/UserAdmin'
import {
  createUser,
  deleteServer,
  deleteUser,
  fetchServers,
  fetchUsers,
  setUserPage,
  setUserQueryString,
  updateServer
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

import type {AppState, RouterProps} from '../../types/reducers'

export type Props = RouterProps

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    activeComponent: ownProps.routeParams.subpage,
    organizations: state.admin.organizations,
    projects: state.projects.all,
    otpServers: state.admin.servers,
    user: state.user,
    users: state.admin.users
  }
}

const mapDispatchToProps = {
  createOrganization,
  createUser,
  deleteOrganization,
  deleteServer,
  deleteUser,
  fetchOrganizations,
  fetchProjectFeeds,
  fetchProjects,
  fetchServers,
  fetchUsers,
  setUserPage,
  setUserQueryString,
  updateOrganization,
  updateServer,
  updateUserData
}

const ActiveUserAdmin = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAdmin)

export default ActiveUserAdmin
