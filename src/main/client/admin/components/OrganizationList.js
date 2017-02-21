import React, { PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import { Panel, Modal, Row, Col, Button, FormControl, Label, ListGroup, ListGroupItem, Image } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import validator from 'validator'

import UserPermissions from '../../common/user/UserPermissions'
import { getComponentMessages, getMessage } from '../../common/util/config'
import OrganizationSettings from './OrganizationSettings'

export default class OrganizationList extends Component {
  static propTypes = {
    // userSearch: PropTypes.func,
    // page: PropTypes.number,
    // perPage: PropTypes.number,
    // userCount: PropTypes.number,
    // projects: PropTypes.array,
    // fetchProjectFeeds: PropTypes.func,
    // createUser: PropTypes.func,
    // setPage: PropTypes.func,
    // isFetching: PropTypes.bool,
    organizations: PropTypes.object,
    users: PropTypes.object
    // setUserPermission: PropTypes.func,
    // saveUser: PropTypes.func,
    // deleteUser: PropTypes.func,
    // token: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  componentWillMount () {
    this.props.fetchOrganizations()
  }
  userSearch () {
    this.props.userSearch(ReactDOM.findDOMNode(this.refs.searchInput).value)
  }
  showModal = () => {
    this.setState({showModal: true})
  }
  close = () => {
    this.setState({showModal: false})
  }
  save = () => {
    const settings = this.refs.orgSettings.getSettings()
    if (settings) {
      this.props.createOrganization(settings)
      .then(org => {
        this.close()
      })
    } else {
      console.log('must provide org name')
      // this.setState({errorMessage: true})
    }
  }
  render () {
    const messages = getComponentMessages('OrganizationList')
    const { isFetching, organizations, users } = this.props
    return (
      <div>
        <Panel
          header={
            <Row>
              <Col xs={10} className='form-inline'>
                <FormControl type='text'
                  ref='searchInput'
                  placeholder={getMessage(messages, 'search')}
                  onKeyUp={e => {
                    if (e.keyCode === 13) this.userSearch()
                  }} />
              </Col>
              <Col xs={2}>
                <Button
                  onClick={this.showModal}
                  bsStyle='primary'
                >
                  <Icon type='plus' />{' '}
                  {getMessage(messages, 'new')}
                </Button>
              </Col>
            </Row>
          }
        >
          <ListGroup fill>
            {isFetching
            ? <ListGroupItem style={{ fontSize: '18px', textAlign: 'center' }}>
              <Icon className='fa-2x fa-spin' type='refresh' />
            </ListGroupItem>
            : organizations.data && organizations.data.map((organization, i) => {
              const orgUsers = users.data ? users.data.filter(u => {
                let permissions = new UserPermissions(u.app_metadata && u.app_metadata.datatools ? u.app_metadata.datatools : null)
                return permissions.getOrganizationId() === organization.id
              }) : []
              return <OrganizationRow
                {...this.props}
                organization={organization}
                key={i}
                users={orgUsers}
                // fetchProjectFeeds={this.props.fetchProjectFeeds}
                // setUserPermission={this.props.setUserPermission}
                // saveUser={this.props.saveUser.bind(this)}
                // deleteUser={this.props.deleteUser.bind(this)}
                // token={this.props.token}
              />
            })
          }
          </ListGroup>
        </Panel>
        <Modal
          show={this.state.showModal}
          onHide={this.close}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create Organization</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OrganizationSettings
              {...this.props}
              ref='orgSettings'
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.save}
            >
              {getMessage(messages, 'new')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

class OrganizationRow extends Component {
  static propTypes = {
    organization: PropTypes.object,
    users: PropTypes.array
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
    const settings = this.refs.orgSettings.getSettings()
    this.props.updateOrganization(this.props.organization, settings)
    this.toggleExpansion()
  }

  delete () {
    this.props.deleteOrganization(this.props.organization)
    this.toggleExpansion()
  }
  render () {
    const {
      organization,
      users
    } = this.props
    return (
      <ListGroupItem
        header={
          <Row>
            <Col xs={4} sm={2} md={1}>
              <Image
                // style={{maxWidth: '120px', maxHeight: '120px'}}
                responsive rounded
                src={organization.logoUrl && validator.isURL(organization.logoUrl, {protocol: 'https'}) ? organization.logoUrl : `http://placehold.it/60x60?text=${organization.name.substr(0, 3)}`}
                alt={organization.name}
              />
            </Col>
            <Col xs={8} sm={5} md={6}>
              <h5>
                {organization.name}{' '}
                {users.length ? <Label>{users.length} users</Label> : null}
              </h5>
              <small />
            </Col>
            <Col xs={12} sm={5} md={5}>
              <Button className='pull-right' onClick={() => this.toggleExpansion()}>
                {this.state.isEditing
                   ? <span><Icon type='remove' /> Cancel</span>
                   : <span><Icon type='edit' /> Edit</span>
                 }
              </Button>
              {this.state.isEditing
                ? <Button
                  className='pull-right'
                  bsStyle='primary'
                  style={{marginRight: '5px'}}
                  onClick={this.save.bind(this)}>
                  <Icon type='save' /> Save
                </Button>
                : null
              }
              {this.state.isEditing
                ? <Button
                  className='pull-right'
                  bsStyle='danger'
                  style={{marginRight: '5px'}}
                  onClick={this.delete.bind(this)}>
                  <Icon type='trash' /> Delete
                </Button>
                : null
              }
            </Col>
          </Row>
        }
      >
        { this.state.isEditing
          ? <OrganizationSettings
            {...this.props}
            ref='orgSettings'
          />
          : ''
        }
      </ListGroupItem>
    )
  }
}
