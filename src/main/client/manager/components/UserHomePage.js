import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Panel, Button, ButtonToolbar, ButtonGroup, Jumbotron, Glyphicon, Badge, FormControl, ListGroup, ListGroupItem, OverlayTrigger, Popover, DropdownButton, MenuItem } from 'react-bootstrap'
import Icon from 'react-fa'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import moment from 'moment'

import ManagerPage from '../../common/components/ManagerPage'
import EditableTextField from '../../common/components/EditableTextField'
import { getConfigProperty, getComponentMessages } from '../../common/util/config'
import defaultSorter from '../../common/util/util'

export default class UserHomePage extends Component {

  static propTypes = {
    user: PropTypes.object,
    projects: PropTypes.array,

    onComponentMount: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  componentWillUnmount () {
    this.setState({showLoading: true})
  }
  render () {
    const messages = getComponentMessages('UserHomePage')
    const projectCreationDisabled = !this.props.user.permissions.isApplicationAdmin()

    const visibleProjects = this.props.projects.filter((project) => {
          if (project.isCreating) return true // projects actively being created are always visible
          return project.name.toLowerCase().indexOf((this.props.visibilitySearchText || '').toLowerCase()) !== -1
        }).sort(defaultSorter)
    const activeProject = visibleProjects.length > 0 ? visibleProjects[0] : null
    const sortByDate = (a, b) => {
      if (a.date < b.date) return 1
      if (a.date > b.date) return -1
      return 0
    }

    return (
      <ManagerPage ref='page'>
        <Grid fluid>
          {this.state.showLoading ? <Icon size='5x' spin name='refresh'/> : null}
          <Row>
            <Col md={8} xs={12}>
              {/* Top Welcome Box */}
              <Jumbotron style={{ padding: 30 }}>
                <h2>Welcome to {getConfigProperty('application.title')}!</h2>
                <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
                <p>
                  <ButtonToolbar>
                  <Button bsStyle='primary' bsSize='large'><Icon name='info-circle' /> Take a Tour</Button>
                  <Button bsStyle='default' bsSize='large' onClick={() => browserHistory.push('/')}><Icon name='globe' /> Explore feeds</Button>
                  </ButtonToolbar>
                </p>
              </Jumbotron>
              {/* Recent Activity List */}
                <h3 style={{ marginTop: 0, paddingBottom: 5, borderBottom: '2px solid #ddd' }}>
                  <Icon name='comments-o' /> Recent Activity
                </h3>
                {this.props.user.recentActivity && this.props.user.recentActivity.length
                  ? this.props.user.recentActivity.sort(sortByDate).map(item => renderRecentActivity(item))
                  : <span>No Recent Activity for your subscriptions.</span>
                }
              </Col>

            <Col md={4} xs={12}>
              {/* User Account Info Panel */}
              <Panel>
                <Row>
                <Col xs={12}>
                <h4 style={{marginTop: 0, marginBottom: 15}}>
                  <Button className='pull-right' bsSize='xsmall'><Icon name='sign-out'/> Log out</Button>
                  Hello, {this.props.user.profile.nickname}.
                </h4>
                </Col>
                </Row>
                <Row>
                  <Col xs={4}>
                    <img style={{ width: '100%', borderRadius: '50%' }} src={this.props.user.profile.picture} />
                  </Col>
                  <Col md={8}>
                    <div style={{ color: '#666' }}><Icon name='user' /> {this.props.user.profile.email}</div>
                    <div><Badge style= {{ backgroundColor: '#bbb' }}>Application Admin</Badge></div>
                    <div style={{ marginTop: 15 }}>
                      <ButtonToolbar className='pull-right'>
                        <Button bsStyle='primary' bsSize='small'
                          onClick={() => { browserHistory.push('/settings/profile') }}
                        >
                          <Icon name='cog' /> Manage Account
                        </Button>
                        {this.props.user.permissions.isApplicationAdmin()
                          ? <LinkContainer to='/admin/users'>
                              <Button bsStyle='default' bsSize='small'>
                                <Icon name='cog' /> Admin
                              </Button>
                            </LinkContainer>
                          : null
                        }
                      </ButtonToolbar>
                    </div>
                  </Col>
                </Row>
              </Panel>
              <div style={{marginBottom: '20px'}}>
                {activeProject
                  ? <LinkContainer className='pull-right' to={`/project/${activeProject.id}`}><Button>View {activeProject.name}</Button></LinkContainer>
                  : null
                }
                <DropdownButton
                  title={visibleProjects.length > 0
                    ? <span><Icon name='folder-open-o'/> {visibleProjects[0].name}</span>
                    : <span><img height={20} width={20} src={this.props.user.profile.picture}/> {this.props.user.profile.nickname}</span>
                  }
                  onSelect={(eventKey) => {
                    this.props.setActiveProject(eventKey)
                  }}
                >
                  {visibleProjects.length > 0
                    ? visibleProjects.map((project, index) => {
                      if (index !== 0)
                      return (
                        <MenuItem key={project.id} eventKey={project.id}><Icon name='folder-o'/> {project.name}</MenuItem>
                      )
                    })
                    : null
                  }
                  <MenuItem divider />
                  <LinkContainer to='/settings/organizations'><MenuItem><Icon name='users'/> Manage organizations</MenuItem></LinkContainer>
                  <MenuItem divider />
                  <MenuItem><Icon name='plus'/> Create organization</MenuItem>
                </DropdownButton>
              </div>
              {/* Starred Feeds Panel */}
              <Panel header={(<h3>Your feeds</h3>)}>
                <ListGroup fill>
                  <ListGroupItem>
                    <FormControl
                      placeholder={messages.search}
                      onChange={evt => this.props.searchTextChanged(evt.target.value)}
                    />
                    <ButtonGroup style={{marginTop: 10}} justified>
                      <Button
                        active
                        onClick={() => this.props.visibilityFilterChanged('ALL')}
                        bsSize='xsmall'
                        href="#">All</Button>
                      <Button
                        onClick={() => this.props.visibilityFilterChanged('PUBLISHED')}
                        bsSize='xsmall'
                        href="#">Starred</Button>
                      <Button
                        onClick={() => this.props.visibilityFilterChanged('PUBLISHED')}
                        bsSize='xsmall'
                        href="#">Public</Button>
                      <Button
                        onClick={() => this.props.visibilityFilterChanged('PUBLISHED')}
                        bsSize='xsmall'
                        href="#">Private</Button>
                    </ButtonGroup>
                  </ListGroupItem>
                  {this.props.projects && this.props.projects.map(p => {
                    return p.feedSources && p.feedSources.map(fs => {
                      const feedName = `${p.name} / ${fs.name}`
                      return (
                        <ListGroupItem key={fs.id} bsStyle={fs.isPublic ? 'default' : 'warning'}>
                          <Link title={feedName} to={`feed/${fs.id}`}>
                            <Icon className='icon-link' name={fs.isPublic ? 'database' : 'lock'}/>
                            <span style={{ fontSize: 16, fontWeight: 500 }}>
                              {feedName.length > 33 ? `${feedName.substr(0, 33)}...` : feedName}
                            </span>
                          </Link>
                        </ListGroupItem>
                      )
                    })
                  })}
                </ListGroup>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}

function renderRecentActivity (item) {
  const containerStyle = {
    marginTop: 10,
    paddingBottom: 12,
    borderBottom: '1px solid #ddd'
  }

  const iconStyle = {
    float: 'left',
    fontSize: 20,
    color: '#bbb'
  }

  const dateStyle = {
    color: '#999',
    fontSize: 11,
    marginBottom: 2
  }

  const innerContainerStyle = {
    marginLeft: 36
  }

  const commentStyle = {
    backgroundColor: '#f0f0f0',
    marginTop: 8,
    padding: 8,
    fontSize: 12
  }

  switch (item.type) {
    case 'feed-commented-on':
      return (
        <div style={containerStyle}>
          <div style={iconStyle}>
            <Icon name='comment' />
          </div>
          <div style={innerContainerStyle}>
            <div style={dateStyle}>{moment(item.date).fromNow()}</div>
            <div><a href="#"><b>{item.userName}</b></a> commented on feed <a href="#"><b>{item.targetName}</b></a>:</div>
            <div style={commentStyle}><i>{item.body}</i></div>
          </div>
        </div>
      )
  }
}
