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
import { LinkContainer } from 'react-router-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import {getComponentMessages, getMessage, isModuleEnabled} from '../../common/util/config'
import OrganizationList from './OrganizationList'
import UserList from './UserList'
import UserPermissions from '../../common/user/UserPermissions'

import type {Organization, Project, UserProfile} from '../../types'
import type {AdminUsersState, OrganizationsState, ManagerUserState} from '../../types/reducers'

type Props = {
  activeComponent: string,
  createOrganization: any => Promise<any>,
  createUser: ({email: string, password: string, permissions: UserPermissions}) => void,
  deleteOrganization: Organization => void,
  deleteUser: UserProfile => void,
  fetchOrganizations: () => void,
  fetchProjectFeeds: string => void,
  isFetching: boolean,
  onComponentMount: Props => void,
  organizations: OrganizationsState,
  projects: Array<Project>,
  saveUser: (UserProfile, any) => void,
  saveOrganization: Organization => void,
  setPage: number => void,
  setUserPermission: (UserProfile, any) => void,
  updateOrganization: (Organization, any) => void,
  user: ManagerUserState,
  users: AdminUsersState,
  userSearch: ?string => void
}

export default class UserAdmin extends Component<Props> {
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    const {
      user,
      users,
      organizations,
      projects,
      activeComponent,
      setUserPermission,
      saveUser,
      deleteUser,
      fetchProjectFeeds,
      createUser,
      setPage,
      userSearch
    } = this.props
    const messages: {[string]: string} = getComponentMessages('UserAdmin')
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
        title={getMessage(messages, 'title')}>
        <Grid>
          <Row style={{ marginBottom: '18px' }}>
            <Col xs={12}>
              <h2>
                <LinkContainer className='pull-right' to='/home'>
                  <Button>
                    Back to dashboard
                  </Button>
                </LinkContainer>
                <Icon type='cog' /> {getMessage(messages, 'title')}
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
                      token={user.token || 'token-invalid'}
                      projects={projects}
                      organizations={organizations.data}
                      users={users.data}
                      userCount={users.userCount}
                      page={users.page}
                      perPage={users.perPage}
                      isFetching={users.isFetching}
                      creatingUser={user}
                      setUserPermission={setUserPermission}
                      saveUser={saveUser}
                      deleteUser={deleteUser}
                      fetchProjectFeeds={fetchProjectFeeds}
                      createUser={createUser}
                      setPage={setPage}
                      userSearch={userSearch} />
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
                  ? <p>{getMessage(messages, 'noAccess')}</p>
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
