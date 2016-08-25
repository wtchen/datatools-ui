import React, { PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Panel, Grid, Row, Col, Button, Label, ButtonGroup, InputGroup, FormControl, Glyphicon, Image, ListGroup, ListGroupItem } from 'react-bootstrap'
import Icon from 'react-fa'

import CreateUser from './CreateUser'
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
  }

  userSearch () {
    this.props.userSearch(ReactDOM.findDOMNode(this.refs.searchInput).value)
  }

  render () {
    const headerStyle = {
      fontSize: '18px',
      marginLeft: '12px'
    }

    const messages = getComponentMessages('UserList')
    const minUserIndex = this.props.page * this.props.perPage + 1
    const maxUserIndex = Math.min((this.props.page + 1) * this.props.perPage, this.props.userCount)
    const maxPage = Math.ceil(this.props.userCount / this.props.perPage) - 1

    return (
      <div>
        <Row style={{ marginBottom: '18px' }}>
          <Col xs={12}>
            <ButtonGroup>
              <Button
                disabled={this.props.page <= 0}
                onClick={() => {
                  this.props.setPage(this.props.page - 1)
                }}
              >
                <Glyphicon glyph='arrow-left' />
              </Button>
              <Button
                disabled={this.props.page >= maxPage}
                onClick={() => {
                  this.props.setPage(this.props.page + 1)
                }}
              >
                <Glyphicon glyph='arrow-right' />
              </Button>
            </ButtonGroup>
            {this.props.userCount > 0
              ? <span style={headerStyle}>{getMessage(messages, 'showing')} {minUserIndex } - {maxUserIndex} {getMessage(messages, 'of')} {this.props.userCount}</span>
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
                    }}
                  />
                  <InputGroup.Addon>
                    <Glyphicon
                      glyph='remove'
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        ReactDOM.findDOMNode(this.refs.searchInput).value = ''
                        this.props.userSearch('')
                      }}
                    />
                  </InputGroup.Addon>
                </InputGroup>
                <Button bsStyle='primary'
                  style={{marginLeft: '8px'}}
                  onClick={e => { this.userSearch() }}
                >
                  <Glyphicon glyph='search' />
                </Button>
            </Col>
            <Col xs={2}>
              <CreateUser
                projects={this.props.projects}
                fetchProjectFeeds={this.props.fetchProjectFeeds}
                createUser={this.props.createUser.bind(this)}
              />
            </Col>
          </Row>
          }
        >
          <ListGroup fill>
          {this.props.isFetching
            ? <ListGroupItem style={{ fontSize: '18px', textAlign: 'center' }}>
                <Icon size='2x' spin name='refresh' />
              </ListGroupItem>
            : this.props.users.map((user, i) => {
              return <UserRow
                projects={this.props.projects}
                user={user}
                key={i}
                fetchProjectFeeds={this.props.fetchProjectFeeds}
                // setUserPermission={this.props.setUserPermission}
                saveUser={this.props.saveUser.bind(this)}
                deleteUser={this.props.deleteUser.bind(this)}
                token={this.props.token}
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
    this.props.deleteUser(this.props.user)
    this.toggleExpansion()
  }

  render () {
    let permissions = new UserPermissions(this.props.user.app_metadata && this.props.user.app_metadata.datatools ? this.props.user.app_metadata.datatools : null)
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
                src={this.props.user.picture}
                alt={this.props.user.email}
              />
            </Col>
            <Col xs={8} sm={5} md={6}>
              <h5>{this.props.user.email} {permissions.isApplicationAdmin() ? <Label bsStyle='warning'>Admin</Label> : null}</h5>
              <small></small>
            </Col>
            <Col xs={12} sm={5} md={5}>
              <Button className='pull-right' onClick={() => this.toggleExpansion()}>
                 {this.state.isEditing
                   ? <span><Glyphicon glyph='remove' /> Cancel</span>
                   : <span><Glyphicon glyph='edit' /> Edit</span>
                 }
              </Button>
              {this.state.isEditing
                ? <Button
                    className='pull-right'
                    bsStyle='primary'
                    style={{marginRight: '5px'}}
                    onClick={this.save.bind(this)}
                  >
                    <Glyphicon glyph='save' /> Save
                  </Button>
                : null
              }
              {this.state.isEditing
                ? <Button
                    className='pull-right'
                    bsStyle='danger'
                    style={{marginRight: '5px'}}
                    onClick={this.delete.bind(this)}
                  >
                    <Glyphicon glyph='trash' /> Delete
                  </Button>
                : null
              }
            </Col>
          </Row>
        }
      >
        { this.state.isEditing
          ? <UserSettings ref='userSettings'
              projects={this.props.projects}
              fetchProjectFeeds={this.props.fetchProjectFeeds}
              permissions={permissions}
            />
          : ''
        }
      </ListGroupItem>
    )
  }
}
