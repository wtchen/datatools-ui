import React, { PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import { Panel, Row, Col, Button, Label, ButtonGroup, InputGroup, FormControl, Image, ListGroup, ListGroupItem } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
// import Select from 'react-select'

import CreateUser from './CreateUser'
import ConfirmModal from '../../common/components/ConfirmModal'
import UserSettings from './UserSettings'
import UserPermissions from '../../common/user/UserPermissions'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class UserList extends Component {
  static propTypes = {
    userSearch: PropTypes.func,
    page: PropTypes.number,
    perPage: PropTypes.number,
    userCount: PropTypes.number,
    projects: PropTypes.array,
    fetchProjectFeeds: PropTypes.func,
    createUser: PropTypes.func,
    setPage: PropTypes.func,
    isFetching: PropTypes.bool,
    users: PropTypes.array,
    setUserPermission: PropTypes.func,
    saveUser: PropTypes.func,
    deleteUser: PropTypes.func,
    token: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  userSearch () {
    this.props.userSearch(ReactDOM.findDOMNode(this.refs.searchInput).value)
  }

  render () {
    const {
      creatingUser,
      organizations,
      page,
      perPage,
      userCount,
      setPage,
      userSearch,
      projects,
      fetchProjectFeeds,
      createUser,
      isFetching,
      users,
      saveUser,
      deleteUser,
      token
    } = this.props
    const headerStyle = {
      fontSize: '18px',
      marginLeft: '12px'
    }

    const messages = getComponentMessages('UserList')
    const minUserIndex = page * perPage + 1
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
                onClick={() => {
                  setPage(page - 1)
                }}>
                <Icon type='arrow-left' />
              </Button>
              <Button
                disabled={page >= maxPage}
                onClick={() => {
                  setPage(page + 1)
                }}>
                <Icon type='arrow-right' />
              </Button>
            </ButtonGroup>
            {userCount > 0
              ? <span style={headerStyle}>{getMessage(messages, 'showing')} {minUserIndex } - {maxUserIndex} {getMessage(messages, 'of')} {userCount}</span>
              : <span style={headerStyle}>(No results to show)</span>
            }
          </Col>
        </Row>
        <Panel
          header={
            <Row>
              <Col xs={10} className='form-inline'>
                <InputGroup ref='foo'>
                  <FormControl type='text'
                    ref='searchInput'
                    placeholder={getMessage(messages, 'search')}
                    onKeyUp={e => {
                      if (e.keyCode === 13) this.userSearch()
                    }} />
                  <InputGroup.Addon>
                    <Icon
                      type='remove'
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        ReactDOM.findDOMNode(this.refs.searchInput).value = ''
                        userSearch('')
                      }} />
                  </InputGroup.Addon>
                </InputGroup>
                <Button bsStyle='primary'
                  style={{marginLeft: '8px'}}
                  onClick={e => { this.userSearch() }}
                >
                  <Icon type='search' />
                </Button>
                {/* TODO: add filter for organization */}
                {/* isApplicationAdmin &&
                  <FormGroup
                    style={{marginLeft: '8px', width: '200px'}}
                  >
                    <Select
                      value={this.state.organization && orgToOption(this.state.organization)}
                      options={organizations.map(orgToOption)}
                      onChange={value => this.setState({organization: value ? value.organization : null})}
                      placeholder={getMessage(messages, 'filterByOrg')}
                    />
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
          }
        >
          <ListGroup fill>
            {isFetching
            ? <ListGroupItem style={{ fontSize: '18px', textAlign: 'center' }}>
              <Icon className='fa-2x fa-spin' type='refresh' />
            </ListGroupItem>
            : users.map((user, i) => {
              return <UserRow
                projects={projects}
                organizations={organizations}
                creatingUser={creatingUser}
                user={user}
                key={i}
                fetchProjectFeeds={fetchProjectFeeds}
                // setUserPermission={setUserPermission}
                saveUser={saveUser.bind(this)}
                deleteUser={deleteUser.bind(this)}
                token={token}
              />
            })
          }
          </ListGroup>
        </Panel>
      </div>
    )
  }
}

class UserRow extends Component {
  static propTypes = {
    user: PropTypes.object,
    saveUser: PropTypes.func,
    deleteUser: PropTypes.func,
    fetchProjectFeeds: PropTypes.func,
    organizations: PropTypes.array,
    projects: PropTypes.array
  }
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }
  }

  toggleExpansion () {
    this.setState({
      isEditing: !this.state.isEditing
    })
  }

  cancel () {
    this.toggleExpansion()
  }

  save () {
    const settings = this.refs.userSettings.getSettings()
    this.props.saveUser(this.props.user, settings)
    this.toggleExpansion()
  }

  delete () {
    const messages = getComponentMessages('UserRow')
    this.refs.confirm.open({
      title: `${getMessage(messages, 'delete')} ${this.props.user.email}?`,
      body: getMessage(messages, 'deleteConfirm'),
      onConfirm: () => {
        this.props.deleteUser(this.props.user)
        this.toggleExpansion()
      }
    })
  }

  render () {
    const {
      creatingUser,
      user,
      organizations,
      projects,
      fetchProjectFeeds
    } = this.props
    const messages = getComponentMessages('UserRow')
    const permissions = new UserPermissions(user.app_metadata && user.app_metadata.datatools ? user.app_metadata.datatools : null)
    const creatorIsApplicationAdmin = creatingUser.permissions.isApplicationAdmin()
    const userOrganization = organizations.find(o => o.id === permissions.getOrganizationId())
    // return null if creating user is not app admin and list item user is part of a different org
    if (!creatorIsApplicationAdmin && !creatingUser.permissions.hasOrganization(permissions.getOrganizationId())) {
      return null
    }
    return (
      <ListGroupItem
        collapsible
        expanded={this.state.isEditing}
        // bsStyle={permissions.isApplicationAdmin() ? 'warning' : 'default'}
        header={
          <Row>
            <Col xs={4} sm={2} md={1}>
              <Image
                // style={{maxWidth: '120px', maxHeight: '120px'}}
                responsive rounded
                src={user.picture}
                alt={user.email}
              />
            </Col>
            <Col xs={8} sm={5} md={6}>
              <h5>
                {user.email}{' '}
                {permissions.isApplicationAdmin()
                  ? <Label bsStyle='danger'>{getMessage(messages, 'appAdmin')}</Label>
                  : permissions.canAdministerAnOrganization()
                  ? <Label bsStyle='warning'>{getMessage(messages, 'orgAdmin')}</Label>
                  : null
                }{' '}
                {userOrganization && creatorIsApplicationAdmin ? <Label bsStyle='default'>{userOrganization.name}</Label> : null}
              </h5>
              <small />
            </Col>
            <Col xs={12} sm={5} md={5}>
              <Button
                className='pull-right'
                onClick={() => this.toggleExpansion()}>
                {this.state.isEditing
                   ? <span><Icon type='remove' /> {getMessage(messages, 'cancel')}</span>
                   : <span><Icon type='edit' /> {getMessage(messages, 'edit')}</span>
                 }
              </Button>
              {this.state.isEditing
                ? <Button
                  className='pull-right'
                  bsStyle='primary'
                  style={{marginRight: '5px'}}
                  onClick={this.save.bind(this)}>
                  <Icon type='save' /> {getMessage(messages, 'save')}
                </Button>
                : null
              }
              {this.state.isEditing
                ? <Button
                  className='pull-right'
                  bsStyle='danger'
                  style={{marginRight: '5px'}}
                  onClick={this.delete.bind(this)}>
                  <Icon type='trash' /> {getMessage(messages, 'delete')}
                </Button>
                : null
              }
            </Col>
          </Row>
        }
      >
        <ConfirmModal ref='confirm' />
        { this.state.isEditing
          ? <UserSettings ref='userSettings'
            organizations={organizations}
            projects={projects}
            creatingUser={creatingUser}
            fetchProjectFeeds={fetchProjectFeeds}
            permissions={permissions} />
          : ''
        }
      </ListGroupItem>
    )
  }
}
