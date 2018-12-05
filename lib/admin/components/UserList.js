// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Panel, Row, Col, Button, ButtonGroup, InputGroup, FormControl, ListGroup, ListGroupItem} from 'react-bootstrap'

import UserPermissions from '../../common/user/UserPermissions'
import {getComponentMessages} from '../../common/util/config'
import CreateUser from './CreateUser'
import {updateUserData as updateUserDataAction} from '../../manager/actions/user'
import {fetchProjectFeeds as fetchProjectFeedsAction} from '../../manager/actions/feeds'
import UserRow from './UserRow'

import type {Organization, Project, UserProfile} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = {
  createUser: typeof createUserAction,
  creatingUser: ManagerUserState,
  deleteUser: typeof deleteUserAction,
  fetchProjectFeeds: typeof fetchProjectFeedsAction,
  fetchUsers: typeof fetchUsersAction,
  isFetching: boolean,
  organizations: Array<Organization>,
  page: number,
  perPage: number,
  projects: Array<Project>,
  setUserPage: typeof setUserPageAction,
  setUserQueryString: typeof setUserQueryStringAction,
  token: string,
  updateUserData: typeof updateUserDataAction,
  userCount: number,
  users: Array<UserProfile>
}

type State = {
  searchText: string
}

export default class UserList extends Component<Props, State> {
  messages = getComponentMessages('UserList')
  state = {
    searchText: ''
  }

  _clearSearch = () => {
    this.setState({searchText: ''})
    this._userSearch()
  }

  _decrementPage = () => {
    this._setPage(this.props.page - 1)
  }

  _incrementPage = () => {
    this._setPage(this.props.page + 1)
  }

  _onSearchTextChange = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.setState({searchText: e.target.value})

  _onSearchTextKeyUp = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    switch (e.keyCode) {
      case 13: // ENTER
        return this._userSearch()
      default:
        break
    }
  }

  _setPage (pageNumber: number) {
    const {fetchUsers, setUserPage} = this.props
    setUserPage(pageNumber)
    fetchUsers()
  }

  _userSearch = () => {
    const {fetchUsers, setUserPage, setUserQueryString} = this.props
    setUserPage(0)
    setUserQueryString(this.state.searchText || '')
    fetchUsers()
  }

  render () {
    const {
      createUser,
      creatingUser,
      deleteUser,
      fetchProjectFeeds,
      isFetching,
      organizations,
      page,
      perPage,
      projects,
      token,
      updateUserData,
      userCount,
      users
    } = this.props
    const headerStyle = {
      fontSize: '18px',
      marginLeft: '12px'
    }

    const minUserIndex = (page * perPage) + 1
    const maxUserIndex = Math.min((page + 1) * perPage, userCount)
    const maxPage = Math.ceil(userCount / perPage) - 1
    // const isApplicationAdmin = creatingUser.permissions.isApplicationAdmin()
    // const orgToOption = organization => ({organization, value: organization.id, label: organization.name})
    return (
      <div>
        <Row style={{ marginBottom: '18px' }}>
          <Col xs={12}>
            <ButtonGroup>
              <Button
                disabled={page <= 0}
                onClick={this._decrementPage}>
                <Icon type='arrow-left' />
              </Button>
              <Button
                disabled={page >= maxPage}
                onClick={this._incrementPage}>
                <Icon type='arrow-right' />
              </Button>
            </ButtonGroup>
            {userCount > 0
              ? <span style={headerStyle}>
                {this.messages('showing')}{' '}
                {minUserIndex } - {maxUserIndex}{' '}
                {this.messages('of')} {userCount}
              </span>
              : <span style={headerStyle}>(No results to show)</span>
            }
          </Col>
        </Row>
        <Panel
          header={
            <Row>
              <Col xs={10} className='form-inline'>
                <InputGroup ref='foo'>
                  <FormControl
                    type='text'
                    autoFocus
                    value={this.state.searchText}
                    placeholder={this.messages('search')}
                    onKeyUp={this._onSearchTextKeyUp}
                    onChange={this._onSearchTextChange} />
                  <InputGroup.Button>
                    <Button
                      onClick={this._clearSearch}>
                      <Icon type='remove' />
                    </Button>
                    <Icon
                      type='remove'
                      style={{ cursor: 'pointer' }}
                      onClick={this._clearSearch} />
                  </InputGroup.Button>
                </InputGroup>
                <Button
                  style={{marginLeft: '8px'}}
                  onClick={this._userSearch}>
                  <Icon type='refresh' />
                </Button>
                {/* TODO: add filter for organization */}
                {/* isApplicationAdmin &&
                  <FormGroup style={{marginLeft: '8px', width: '200px'}}>
                    <Select
                      value={this.state.organization && orgToOption(this.state.organization)}
                      options={organizations.map(orgToOption)}
                      onChange={value => this.setState({organization: value ? value.organization : null})}
                      placeholder={this.messages('filterByOrg')} />
                  </FormGroup>
                */}
              </Col>
              <Col xs={2}>
                <CreateUser
                  projects={projects}
                  organizations={organizations}
                  creatingUser={creatingUser}
                  fetchProjectFeeds={fetchProjectFeeds}
                  createUser={createUser.bind(this)} />
              </Col>
            </Row>
          }>
          <ListGroup fill>
            {isFetching
              ? <ListGroupItem style={{ fontSize: '18px', textAlign: 'center' }}>
                <Icon className='fa-2x fa-spin' type='refresh' />
              </ListGroupItem>
              : users.map((user, i) => {
                return <UserRow
                  creatingUser={creatingUser}
                  deleteUser={deleteUser}
                  fetchProjectFeeds={fetchProjectFeeds}
                  key={i}
                  organizations={organizations}
                  projects={projects}
                  token={token}
                  updateUserData={updateUserData}
                  user={user}
                />
              })
            }
          </ListGroup>
        </Panel>
      </div>
    )
  }
}
