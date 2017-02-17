import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col, Panel, ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import Helmet from 'react-helmet'
import {Icon} from '@conveyal/woonerf'

import ManagerPage from '../../common/components/ManagerPage'
import UserList from './UserList'
import OrganizationList from './OrganizationList'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class UserAdmin extends Component {
  static propTypes = {
    user: PropTypes.object,

    onComponentMount: PropTypes.func,
    setUserPermission: PropTypes.func,
    createUser: PropTypes.func,
    saveUser: PropTypes.func,
    deleteUser: PropTypes.func,
    setPage: PropTypes.func,
    userSearch: PropTypes.func,
    fetchProjectFeeds: PropTypes.func,

    admin: PropTypes.object,
    activeComponent: PropTypes.string,
    projects: PropTypes.array

  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    const {
      user,
      users,
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
    const messages = getComponentMessages('UserAdmin')
    const isAdmin = user && user.permissions && user.permissions.isApplicationAdmin()
    return (
      <ManagerPage ref='page'>
        <Helmet
          title={getMessage(messages, 'title')}
        />
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
                      <LinkContainer to='/admin/users'><ListGroupItem>User management</ListGroupItem></LinkContainer>
                      <LinkContainer to='/admin/organizations'><ListGroupItem>Organizations</ListGroupItem></LinkContainer>
                      <LinkContainer to='/admin/logs'><ListGroupItem>Application logs</ListGroupItem></LinkContainer>
                      {/*
                        <LinkContainer to='/admin/regions'><ListGroupItem>Regions</ListGroupItem></LinkContainer>
                      */}
                    </ListGroup>
                  </Panel>
                </Col>
                <Col xs={12} sm={9}>
                  {
                    users.data &&
                    projects &&
                    activeComponent === 'users'
                    ? <UserList
                      token={user.token}
                      projects={projects}
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
                      userSearch={userSearch}
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
                  : activeComponent === 'organizations'
                  ? <OrganizationList
                    {...this.props}
                    />
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
