import React from 'react'
import ReactDOM from 'react-dom'
import { Panel, Grid, Row, Col, Button, FormGroup, InputGroup, FormControl, Glyphicon } from 'react-bootstrap'

import CreateUser from './CreateUser'
import UserSettings from './UserSettings'
import UserPermissions from '../../common/user/UserPermissions'
import { getComponentMessages } from '../../common/util/config'

export default class UserList extends React.Component {

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

      <Grid>
        <Row style={{ marginBottom: '18px' }}>
          <Col xs={12}>
            <h2>{messages.title}</h2>
          </Col>
        </Row>

        <Row style={{ marginBottom: '18px' }}>
          <Col xs={4}>
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
            {this.props.userCount > 0
              ? <span style={headerStyle}>{messages.showing} {minUserIndex } - {maxUserIndex} {messages.of} {this.props.userCount}</span>
              : <span style={headerStyle}>(No results to show)</span>
            }
          </Col>
          <Col xs={4} className='form-inline' style={{ textAlign: 'center' }}>
            <FormGroup>
              <InputGroup ref='foo'>
                <FormControl type="text"
                  ref="searchInput"
                  placeholder={messages.search}
                  onKeyUp={e => {
                    if(e.keyCode === 13) this.userSearch()
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
            </FormGroup>

            <Button bsStyle='primary'
              style={{ marginLeft: '8px' }}
              onClick={e => { this.userSearch() }}
            >
              <Glyphicon glyph='search' />
            </Button>
          </Col>
          <Col xs={4}>
            <CreateUser
              projects={this.props.projects}
              fetchProjectFeeds={this.props.fetchProjectFeeds}
              createUser={this.props.createUser.bind(this)}
            />
          </Col>
        </Row>

        {this.props.isFetching
          ? <Row style={{ fontSize: '18px', textAlign: 'center' }}><i>Loading...</i></Row>
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

      </Grid>
    )
  }
}

class UserRow extends React.Component {

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
    console.log('saving ', this.props.user)

    const settings = this.refs.userSettings.getSettings()
    const type = ['projects', 'permissions']
    console.log(settings)
    console.log(this.props.user)
    this.props.saveUser(this.props.user, settings)

    this.toggleExpansion()
  }

  delete () {
    console.log('deleting ', this.props.user)

    const settings = this.refs.userSettings.getSettings()
    const type = ['projects', 'permissions']
    console.log(settings)
    console.log(this.props.user)
    this.props.deleteUser(this.props.user)

    this.toggleExpansion()
  }

  render () {
    let permissions = new UserPermissions(this.props.user.app_metadata && this.props.user.app_metadata.datatools ? this.props.user.app_metadata.datatools : null)
    return (
      <Panel collapsible expanded={this.state.isEditing} header={
        <Row>
          <Col xs={8}>
            <h4><Glyphicon glyph='user' /> {this.props.user.email}</h4>
          </Col>
          <Col xs={4}>
            <Button className='pull-right' onClick={this.toggleExpansion.bind(this)}>
               {this.state.isEditing
                 ? <span><Glyphicon glyph='remove' /> Cancel</span>
                 : <span><Glyphicon glyph='edit' /> Edit</span>
               }
            </Button>
            {this.state.isEditing ?
              <Button
                className='pull-right'
                bsStyle='primary'
                style={{marginRight: '5px'}}
                onClick={this.save.bind(this)}
              >
                <Glyphicon glyph='save' /> Save
              </Button>
              : null
            }
            {this.state.isEditing ?
              <Button
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
      }>
        { this.state.isEditing ?
          <UserSettings ref='userSettings'
            projects={this.props.projects}
            fetchProjectFeeds={this.props.fetchProjectFeeds}
            permissions={permissions}
          /> : ''
        }
      </Panel>
    )
  }
}
