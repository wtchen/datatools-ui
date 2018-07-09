import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col, Button, Panel, ListGroup, ListGroupItem, ControlLabel } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import auth0 from '../../common/user/Auth0Manager'
import ManagerPage from '../../common/components/ManagerPage'
import { getConfigProperty, getComponentMessages, getMessage } from '../../common/util/config'

export default class UserAccount extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,
    getUser: PropTypes.func,
    unsubscribeAll: PropTypes.func,
    user: PropTypes.object
  }

  componentWillMount () {
    this.props.onComponentMount(this.props, () => {
      this.setState({ loadedProjectsAndFeed: true })
    })
  }

  _onClickGet = () => this.props.getUser(this.props.user.profile.user_id)

  _onClickUnsubscribeAll = () => this.props.unsubscribeAll(this.props.user.profile)

  _onResetPassword = () => auth0.resetPassword()

  render () {
    const {user} = this.props
    const messages = getComponentMessages('UserAccount')
    const subscriptions = user.profile.app_metadata.datatools.find(dt => dt.client_id === process.env.AUTH0_CLIENT_ID).subscriptions
    const ACCOUNT_SECTIONS = [
      {
        id: 'profile',
        component: (
          <div>
            <Panel header={<h4>Profile information</h4>}>
              <ListGroup fill>
                <ListGroupItem>
                  <ControlLabel>Email address</ControlLabel>
                  <div>{user.profile.email}</div>
                </ListGroupItem>
                <ListGroupItem>
                  <p><strong>Avatar</strong></p>
                  <a href='http://gravatar.com'>
                    <img
                      alt='Profile'
                      className='img-rounded'
                      height={40}
                      width={40}
                      src={user.profile.picture} />
                    <span style={{marginLeft: '10px'}}>Change on gravatar.com</span>
                  </a>
                </ListGroupItem>
                <ListGroupItem>
                  <p><strong>Password</strong></p>
                  <Button
                    onClick={this._onResetPassword}>
                    Change password
                  </Button>
                </ListGroupItem>
              </ListGroup>
            </Panel>
          </div>
        )
      },
      {
        id: 'account',
        hidden: !getConfigProperty('modules.enterprise.enabled')
      },
      {
        id: 'organizations',
        hidden: !getConfigProperty('modules.enterprise.enabled')
      },
      {
        id: 'notifications',
        hidden: !getConfigProperty('application.notifications_enabled'),
        component: (
          <div>
            {/* TODO: implement this on back-end
            <Panel header={<h4>Notification methods</h4>}>
              <ListGroup fill>
                <ListGroupItem>
                  <h4>Watching</h4>
                  <p>Receive updates to any feed sources or comments you are watching.</p>
                  <Checkbox inline>Email</Checkbox>{' '}<Checkbox inline>Web</Checkbox>
                </ListGroupItem>
              </ListGroup>
            </Panel> */}
            <Panel
              header={
                <h4>
                  <Button
                    onClick={this._onClickUnsubscribeAll}
                    className='pull-right'
                    bsStyle='info'
                    bsSize='xsmall'
                  >
                    <Icon type='eye-slash' />
                    {' '}
                    {getMessage(messages, 'notifications.unsubscribeAll')}
                  </Button>
                  {getMessage(messages, 'notifications.subscriptions')}
                </h4>
              }>
              {subscriptions && subscriptions.length
                ? <SubscriptionsManager subscriptions={subscriptions} {...this.props} />
                : <li>No subscriptions.</li>
              }
            </Panel>
          </div>
        )
      },
      {
        id: 'billing',
        hidden: !getConfigProperty('modules.enterprise.enabled')
      }
    ]
    const activeSection = ACCOUNT_SECTIONS.find(section => section.id === this.props.activeComponent)
    const visibleComponent = activeSection ? activeSection.component : null
    return (
      <ManagerPage ref='page'>
        <Grid fluid>
          <Row style={{marginBottom: '20px'}}>
            <Col xs={12}>
              <h1>
                <LinkContainer className='pull-right' to={{ pathname: '/home' }}>
                  <Button>Back to dashboard</Button>
                </LinkContainer>
                <Icon type='user' /> My settings
              </h1>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <Panel header={<h4>{getMessage(messages, 'personalSettings')}</h4>}>
                <ListGroup fill>
                  {ACCOUNT_SECTIONS.map(section => {
                    if (section.hidden) return null
                    return (
                      <LinkContainer key={section.id} to={`/settings/${section.id}`}>
                        <ListGroupItem active={this.props.activeComponent === section.id}>
                          {getMessage(messages, `${section.id}.title`)}
                        </ListGroupItem>
                      </LinkContainer>
                    )
                  })}
                </ListGroup>
              </Panel>
              <Panel header={<h4>{getMessage(messages, 'organizationSettings')}</h4>}>
                <ListGroup fill>
                  {this.props.projects && this.props.projects.map(project => {
                    if (project.hidden) return null
                    return (
                      <LinkContainer key={project.id} to={`/project/${project.id}/settings`}>
                        <ListGroupItem active={this.props.projectId === project.id}>
                          {project.name}
                        </ListGroupItem>
                      </LinkContainer>
                    )
                  })}
                </ListGroup>
              </Panel>
            </Col>
            <Col xs={1} />
            <Col xs={6}>
              {visibleComponent}
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}

class SubscriptionsManager extends Component {
  render () {
    const { subscriptions } = this.props

    const projectSub = subscriptions.find(sub => sub.type === 'project-updated')
    const feedSub = subscriptions.find(sub => sub.type === 'feed-updated')
    return <div>
      {projectSub && (
        <div>
          <h4><Icon type='eye' /> Watched Projects</h4>
          {projectSub.target.length
            ? (
              <ListGroup>
                {projectSub.target.map((target, k) =>
                  <WatchedProject key={k} target={target} {...this.props} />
                )}
              </ListGroup>
            )
            : <span>No projects currently being watched</span>
          }
        </div>
      )}
      {feedSub && (
        <div style={{ marginTop: 30 }}>
          <h4><Icon type='eye' /> Watched Feeds</h4>
          {feedSub.target.length
            ? (
              <ListGroup>
                {feedSub.target.map((target, k) =>
                  <WatchedFeed key={k} target={target} {...this.props} />
                )}
              </ListGroup>
            )
            : <span>No feeds currently being watched</span>
          }
        </div>
      )}
    </div>
  }
}

class WatchedProject extends Component {
  _onClickRemoveSubscriptionTarget = () => {
    const {target, updateUserSubscription, user} = this.props
    updateUserSubscription(user.profile, target, 'project-updated')
  }

  render () {
    const {projects, target} = this.props
    const project = projects && projects.find(p => p.id === target)
    const projectLink = project
      ? <span><Icon type='folder-open' /> <Link to={`/project/${project.id}`}>{project.name}</Link></span>
      : <span style={{ fontStyle: 'italic', color: 'gray' }}>{target} (Deleted)</span>
    return (
      <ListGroupItem>
        {projectLink}
        <Button bsSize='xsmall' bsStyle='info'
          className='pull-right'
          onClick={this._onClickRemoveSubscriptionTarget}
        ><Icon type='eye-slash' /> Unwatch</Button>
      </ListGroupItem>
    )
  }
}

class WatchedFeed extends Component {
  _onClickRemoveSubscriptionTarget = () => {
    const {target, updateUserSubscription, user} = this.props
    updateUserSubscription(user.profile, target, 'feed-updated')
  }

  render () {
    const {projects, target} = this.props
    // Find the FeedSource and Project, if present
    let feedSource
    let project
    if (projects) {
      for (var i = 0; i < projects.length; i++) {
        if (!projects[i].feedSources) continue
        const fs = projects[i].feedSources.find(fs => fs.id === target)
        if (fs) {
          feedSource = fs
          project = projects[i]
          break
        }
      }
    }

    const fsLink = feedSource
      ? <span>
        <Icon type='folder-open' /> <Link to={`/project/${project.id}`}>{project.name}</Link>
        {' / '}
        <Icon type='bus' /> <Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link>
      </span>
      : <span style={{ fontStyle: 'italic', color: 'gray' }}>{target} (Deleted)</span>
    return (
      <ListGroupItem>
        {fsLink}
        <Button bsSize='xsmall' bsStyle='info'
          className='pull-right'
          onClick={this._onClickRemoveSubscriptionTarget}
        ><Icon type='eye-slash' /> Unwatch</Button>
      </ListGroupItem>
    )
  }
}
