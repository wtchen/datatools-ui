// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {
  Grid,
  Row,
  Col,
  Panel,
  ListGroup,
  ListGroupItem,
  Button
} from 'react-bootstrap'
import {browserHistory} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import * as adminActions from '../actions/admin'
import * as organizationActions from '../actions/organizations'
import ManagerPage from '../../common/components/ManagerPage'
import {getComponentMessages, isModuleEnabled} from '../../common/util/config'
import * as feedActions from '../../manager/actions/feeds'
import * as projectActions from '../../manager/actions/projects'
import * as managerUserActions from '../../manager/actions/user'
import OrganizationList from './OrganizationList'
import UserList from './UserList'

import type {Project} from '../../types'
import type {AdminUsersState, OrganizationsState, ManagerUserState} from '../../types/reducers'

type Props = {
  activeComponent: string,
  createOrganization: typeof organizationActions.createOrganization,
  createUser: typeof adminActions.createUser,
  deleteOrganization: typeof organizationActions.deleteOrganization,
  deleteUser: typeof adminActions.deleteUser,
  fetchOrganizations: typeof organizationActions.fetchOrganizations,
  fetchProjectFeeds: typeof feedActions.fetchProjectFeeds,
  fetchProjects: typeof projectActions.fetchProjects,
  fetchUsers: typeof adminActions.fetchUsers,
  isFetching: boolean,
  organizations: OrganizationsState,
  projects: Array<Project>,
  setUserPage: typeof adminActions.setUserPage,
  setUserQueryString: typeof adminActions.setUserQueryString,
  updateOrganization: typeof organizationActions.updateOrganization,
  updateUserData: typeof managerUserActions.updateUserData,
  user: ManagerUserState,
  users: AdminUsersState
}

export default class UserAdmin extends Component<Props> {
  messages = getComponentMessages('UserAdmin')

  componentWillMount () {
    const {activeComponent, fetchUsers, fetchProjects, fetchOrganizations, users} = this.props
    if (!activeComponent) {
      browserHistory.push('/admin/users')
    }
    if (!users.data) {
      fetchUsers()
    }

    // always load projects to prevent interference with public feeds viewer loading of projects
    fetchProjects()

    // load orgs because they're needed both in org and user creation
    fetchOrganizations()
  }

  render () {
    const {
      activeComponent,
      createUser,
      deleteUser,
      fetchProjectFeeds,
      fetchUsers,
      organizations,
      projects,
      setUserPage,
      setUserQueryString,
      updateUserData,
      user,
      users
    } = this.props
    const permissions = user && user.permissions
    const isAdmin = permissions &&
      (
        permissions.isApplicationAdmin() ||
        permissions.canAdministerAnOrganization()
      )
    const isApplicationAdmin = permissions && permissions.isApplicationAdmin()
    return (
      <ManagerPage
        ref='page'
        title={this.messages('title')}>
        <Grid>
          <Row style={{ marginBottom: '18px' }}>
            <Col xs={12}>
              <h2>
                <LinkContainer className='pull-right' to='/home'>
                  <Button>
                    Back to dashboard
                  </Button>
                </LinkContainer>
                <Icon type='cog' /> {this.messages('title')}
              </h2>
            </Col>
          </Row>
          <Row>
            {isAdmin
              ? <div>
                <Col xs={12} sm={3}>
                  <Panel>
                    <ListGroup fill>
                      <LinkContainer to='/admin/users'>
                        <ListGroupItem>User management</ListGroupItem>
                      </LinkContainer>
                      {/* Do not show non-appAdmin users these application-level settings */}
                      {!isModuleEnabled('enterprise') && isApplicationAdmin &&
                        <LinkContainer to='/admin/organizations'>
                          <ListGroupItem>Organizations</ListGroupItem>
                        </LinkContainer>
                      }
                      {isApplicationAdmin &&
                        <LinkContainer to='/admin/logs'>
                          <ListGroupItem>Application logs</ListGroupItem>
                        </LinkContainer>
                      }
                    </ListGroup>
                  </Panel>
                </Col>
                <Col xs={12} sm={9}>
                  {users.data &&
                    projects &&
                    organizations.data &&
                    activeComponent === 'users'
                    ? <UserList
                      createUser={createUser}
                      creatingUser={user}
                      deleteUser={deleteUser}
                      fetchProjectFeeds={fetchProjectFeeds}
                      fetchUsers={fetchUsers}
                      isFetching={users.isFetching}
                      organizations={organizations.data}
                      page={users.page}
                      perPage={users.perPage}
                      projects={projects}
                      setUserPage={setUserPage}
                      setUserQueryString={setUserQueryString}
                      token={user.token || 'token-invalid'}
                      updateUserData={updateUserData}
                      userCount={users.userCount}
                      users={users.data}
                    />
                    : activeComponent === 'logs'
                      ? <p className='text-center' style={{marginTop: '100px'}}>
                        <Button
                          bsStyle='danger'
                          bsSize='large'
                          href='https://manage.auth0.com/#/logs'>
                          <Icon type='star' /> View application logs on Auth0.com
                        </Button>
                      </p>
                      : activeComponent === 'organizations' && isApplicationAdmin && !isModuleEnabled('enterprise')
                        ? <OrganizationList {...this.props} />
                        : null
                  }
                </Col>
              </div>
              : <div>
                {user
                  ? <p>{this.messages('noAccess')}</p>
                  : <h1
                    className='text-center'
                    style={{marginTop: '150px'}}>
                    <Icon className='fa-spin fa-5x' type='refresh' />
                  </h1>
                }
              </div>
            }
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
