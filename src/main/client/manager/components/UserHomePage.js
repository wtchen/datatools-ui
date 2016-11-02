import React, {Component, PropTypes} from 'react'
import { Grid, Row, Col, Panel, Button, ButtonToolbar, ButtonGroup, Jumbotron, Badge, FormControl, ListGroup, ListGroupItem, DropdownButton, MenuItem } from 'react-bootstrap'
import Icon from '@conveyal/woonerf'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import moment from 'moment'
import objectPath from 'object-path'

import ManagerPage from '../../common/components/ManagerPage'
import { getConfigProperty, getComponentMessages, getMessage } from '../../common/util/config'
import { defaultSorter, getProfileLink } from '../../common/util/util'

export default class UserHomePage extends Component {

  static propTypes = {
    user: PropTypes.object,
    projects: PropTypes.array,
    project: PropTypes.object,

    onComponentMount: PropTypes.func,
    logoutHandler: PropTypes.func,
    fetchProjectFeeds: PropTypes.func,

    visibilityFilter: PropTypes.object,
    searchTextChanged: PropTypes.func,
    visibilityFilterChanged: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  componentWillReceiveProps (nextProps) {
    const nextId = objectPath.get(nextProps, 'project.id')
    const id = objectPath.get(this.props, 'project.id')
    if (nextId && nextId !== id && !nextProps.project.feedSources) {
      this.props.fetchProjectFeeds(nextProps.project.id)
    }
  }
  componentWillUnmount () {
    this.setState({showLoading: true})
  }
  render () {
    const messages = getComponentMessages('UserHomePage')
    const projectCreationDisabled = !this.props.user.permissions.isApplicationAdmin()
    const feedVisibilityFilter = (feed) => {
      let visible = feed.name.toLowerCase().indexOf((this.props.visibilityFilter.searchText || '').toLowerCase()) !== -1
      switch (this.props.visibilityFilter.filter) {
        case 'ALL':
          return visible
        case 'STARRED':
          return [].indexOf(feed.id) !== -1 // check userMetaData
        case 'PUBLIC':
          return feed.isPublic
        case 'PRIVATE':
          return !feed.isPublic
        default:
          return visible
      }
      // if (feed.isCreating) return true // feeds actively being created are always visible
    }
    const renderFeedItems = (p, fs) => {
      const feedName = `${p.name} / ${fs.name}`
      return (
        <ListGroupItem key={fs.id} bsStyle={fs.isPublic ? 'default' : 'warning'}>
          <Link title={feedName} to={`/feed/${fs.id}`}>
            <Icon className='icon-link' name={fs.isPublic ? 'database' : 'lock'}/>
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {feedName.length > 33 ? `${feedName.substr(0, 33)}...` : feedName}
            </span>
          </Link>
        </ListGroupItem>
      )
    }
    const visibleProjects = this.props.projects.sort(defaultSorter)
    const activeProject = this.props.project
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
                <p>Manage, edit, validate and deploy your data in a streamlined workflow.</p>
                <p>
                  <ButtonToolbar>
                  <Button bsStyle='primary' bsSize='large' href={getConfigProperty('application.docs_url')}><Icon name='info-circle' /> Take a Tour</Button>
                  <LinkContainer to='/'><Button bsStyle='default' bsSize='large'><Icon name='globe' /> Explore feeds</Button></LinkContainer>
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
                  <Button className='pull-right' bsSize='small' onClick={() => this.props.logoutHandler()}><Icon name='sign-out'/> Log out</Button>
                  Hello, {this.props.user.profile.nickname}.
                </h4>
                </Col>
                </Row>
                <Row>
                  <Col xs={4}>
                    <img style={{ width: '100%', borderRadius: '50%' }} src={this.props.user.profile.picture} />
                  </Col>
                  <Col md={8}>
                    <div className='text-muted'><Icon name='user' /> {this.props.user.profile.email}</div>
                    <div><Badge className='text-muted'>
                      {this.props.user.permissions.isApplicationAdmin()
                        ? 'Application admin'
                        : 'Standard user'
                      }
                    </Badge></div>
                    <div style={{ marginTop: 15 }}>
                      <ButtonToolbar className='pull-right'>
                        <LinkContainer to='/settings/profile'>
                          <Button bsStyle='primary' bsSize='small'>
                            <Icon name='cog' /> Manage account
                          </Button>
                        </LinkContainer>
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
                  id='context-dropdown'
                  title={activeProject
                    ? <span><Icon name='folder-open-o'/> {activeProject.name}</span>
                    : <span><img height={20} width={20} src={this.props.user.profile.picture}/> {this.props.user.profile.nickname}</span>
                  }
                  // onSelect={(eventKey) => {
                  //   this.props.setActiveProject(eventKey)
                  // }}
                >
                  {activeProject
                    ? [
                      <LinkContainer key='home-link' to={`/home/`}>
                        <MenuItem>
                          <span><img height={20} width={20} src={this.props.user.profile.picture}/> {this.props.user.profile.nickname}</span>
                        </MenuItem>
                      </LinkContainer>,
                      <MenuItem key='divider' divider/>
                    ]
                    : null
                  }
                  {visibleProjects.length > 0
                    ? visibleProjects.map((project, index) => {
                      if (activeProject && project.id === activeProject.id) {
                        return null
                      }
                      return (
                        <LinkContainer to={`/home/${project.id}`}>
                          <MenuItem key={project.id} eventKey={project.id}>
                            <Icon name='folder-o'/> {project.name}
                          </MenuItem>
                        </LinkContainer>
                      )
                    })
                    : null
                  }
                  {activeProject && visibleProjects.length > 1 || !activeProject ? <MenuItem divider /> : null}
                  <LinkContainer to='/settings/organizations'><MenuItem><Icon name='users'/> Manage organizations</MenuItem></LinkContainer>
                  <MenuItem divider />
                  <LinkContainer to='/project'><MenuItem><Icon name='plus'/> Create organization</MenuItem></LinkContainer>
                </DropdownButton>
              </div>
              {/* Starred Feeds Panel */}
              <Panel header={(<h3>Your feeds</h3>)}>
                <ListGroup fill>
                  <ListGroupItem>
                    <FormControl
                      placeholder={getMessage(messages, 'search')}
                      onChange={evt => this.props.searchTextChanged(evt.target.value)}
                    />
                    <ButtonGroup style={{marginTop: 10}} justified>
                      <Button
                        active={this.props.visibilityFilter.filter === 'ALL' || !this.props.visibilityFilter.filter}
                        onClick={() => this.props.visibilityFilterChanged('ALL')}
                        bsSize='xsmall'
                        href='#'>All</Button>
                      <Button
                        active={this.props.visibilityFilter.filter === 'STARRED'}
                        onClick={() => this.props.visibilityFilterChanged('STARRED')}
                        bsSize='xsmall'
                        href='#'>Starred</Button>
                      <Button
                        active={this.props.visibilityFilter.filter === 'PUBLIC'}
                        onClick={() => this.props.visibilityFilterChanged('PUBLIC')}
                        bsSize='xsmall'
                        href='#'>Public</Button>
                      <Button
                        active={this.props.visibilityFilter.filter === 'PRIVATE'}
                        onClick={() => this.props.visibilityFilterChanged('PRIVATE')}
                        bsSize='xsmall'
                        href='#'>Private</Button>
                    </ButtonGroup>
                  </ListGroupItem>
                  {activeProject && activeProject.feedSources
                    ? activeProject.feedSources.filter(feedVisibilityFilter).map(fs => renderFeedItems(activeProject, fs))
                    : <ListGroupItem><p className='lead text-center'>Choose a project to view feeds</p></ListGroupItem>
                      // this.props.projects && this.props.projects.map(p => {
                      //   return p.feedSources && p.feedSources.filter(feedVisibilityFilter).map(fs => renderFeedItems(p, fs))
                      // })
                  }
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
            <div><a href={getProfileLink(item.userName)}><b>{item.userName}</b></a> commented on feed <Link to={`/feed/${item.targetId}`}><b>{item.targetName}</b></Link>:</div>
            <div style={commentStyle}><i>{item.body}</i></div>
          </div>
        </div>
      )
  }
}
