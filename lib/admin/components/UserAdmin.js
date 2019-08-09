// @flow

import Icon from '@conveyal/woonerf/components/icon'
import * as React from 'react'
import {
  Grid,
  Row,
  Col,
  Panel,
  ListGroup,
  ListGroupItem as LGI,
  Button
} from 'react-bootstrap'
import {browserHistory} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import * as adminActions from '../actions/admin'
import * as organizationActions from '../actions/organizations'
import Loading from '../../common/components/Loading'
import ManagerPage from '../../common/components/ManagerPage'
import {getComponentMessages, isModuleEnabled} from '../../common/util/config'
import * as feedActions from '../../manager/actions/feeds'
import * as projectActions from '../../manager/actions/projects'
import * as managerUserActions from '../../manager/actions/user'
import OrganizationList from './OrganizationList'
import ServerSettings from './ServerSettings'
import UserList from './UserList'

import type {Props as ContainerProps} from '../containers/ActiveUserAdmin'
import type {OtpServer, Project} from '../../types'
import type {
  AdminUsersState,
  OrganizationsState,
  ManagerUserState
} from '../../types/reducers'

type Props = ContainerProps & {
  activeComponent: string,
  createOrganization: typeof organizationActions.createOrganization,
  createUser: typeof adminActions.createUser,
  deleteOrganization: typeof organizationActions.deleteOrganization,
  deleteServer: typeof adminActions.deleteServer,
  deleteUser: typeof adminActions.deleteUser,
  fetchOrganizations: typeof organizationActions.fetchOrganizations,
  fetchProjectFeeds: typeof feedActions.fetchProjectFeeds,
  fetchProjects: typeof projectActions.fetchProjects,
  fetchServers: typeof adminActions.fetchServers,
  fetchUsers: typeof adminActions.fetchUsers,
  isFetching: boolean,
  organizations: OrganizationsState,
  otpServers: Array<OtpServer>,
  projects: Array<Project>,
  setUserPage: typeof adminActions.setUserPage,
  setUserQueryString: typeof adminActions.setUserQueryString,
  updateOrganization: typeof organizationActions.updateOrganization,
  updateServer: typeof adminActions.updateServer,
  updateUserData: typeof managerUserActions.updateUserData,
  user: ManagerUserState,
  users: AdminUsersState
}

export default class UserAdmin extends React.Component<Props> {
  messages = getComponentMessages('UserAdmin')

  componentWillMount () {
    const {
      activeComponent,
      fetchUsers,
      fetchProjects,
      fetchOrganizations,
      fetchServers,
      users
    } = this.props
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

    // load servers if deployments are enabled.
    if (isModuleEnabled('deployment')) fetchServers()
  }

  _getMainContent = (isApplicationAdmin: boolean): React.Node => {
    const {
      activeComponent,
      createUser,
      deleteUser,
      fetchProjectFeeds,
      fetchUsers,
      organizations,
      otpServers,
      projects,
      setUserPage,
      setUserQueryString,
      updateUserData,
      user,
      users
    } = this.props
    switch (activeComponent) {
      case 'users':
        if (!users.data || !projects || !organizations.data) {
          return <Loading />
        } else {
          return (
            <UserList
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
          )
        }
      case 'organizations':
        if (!isApplicationAdmin || isModuleEnabled('enterprise')) return null
        else return <OrganizationList {...this.props} />
      case 'logs':
        return <p className='text-center' style={{marginTop: '100px'}}>
          <Button
            bsStyle='danger'
            bsSize='large'
            href='https://manage.auth0.com/#/logs'>
            <Icon type='star' /> View application logs on Auth0.com
          </Button>
        </p>
      case 'servers':
        if (!isApplicationAdmin || !isModuleEnabled('deployment')) {
          return <p className='text-center lead'>Restricted access</p>
        }
        return <ServerSettings
          projects={projects}
          otpServers={otpServers}
          updateServer={this.props.updateServer}
          deleteServer={this.props.deleteServer}
          editDisabled={false} />
      default:
        return null
    }
  }

  _getLinks = (isApplicationAdmin: boolean): React.Node[] => {
    const links = [{ to: '/admin/users', children: <LGI>User management</LGI> }]
    // Do not show non-appAdmin users these application-level settings
    if (isApplicationAdmin) {
      if (!isModuleEnabled('enterprise')) {
        links.push({ to: '/admin/organizations', children: <LGI>Organizations</LGI> })
      }
      links.push({ to: '/admin/logs', children: <LGI>Application logs</LGI> })
      if (isModuleEnabled('deployment')) {
        links.push({ to: '/admin/servers', children: <LGI>Deployment servers</LGI> })
      }
    }
    return links.map(link => (<LinkContainer key={link.to} {...link} />))
  }

  render () {
    const { user } = this.props
    const permissions = user && user.permissions
    const isAdmin = permissions &&
      (
        permissions.isApplicationAdmin() ||
        permissions.canAdministerAnOrganization()
      )
    const isApplicationAdmin = !!(permissions && permissions.isApplicationAdmin())
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
                      {this._getLinks(isApplicationAdmin)}
                    </ListGroup>
                  </Panel>
                </Col>
                <Col xs={12} sm={9}>
                  {this._getMainContent(isApplicationAdmin)}
                </Col>
              </div>
              : <div>
                {user
                  ? <p>{this.messages('noAccess')}</p>
                  : <h1
                    className='text-center'
                    style={{ marginTop: '150px' }}>
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
