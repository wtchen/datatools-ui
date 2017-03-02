import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { Grid, Row, Col, Button, Panel, Checkbox, ListGroup, ListGroupItem, ControlLabel } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

import EditableTextField from '../../common/components/EditableTextField'
import ManagerPage from '../../common/components/ManagerPage'
import { getConfigProperty, getComponentMessages, getMessage } from '../../common/util/config'

export default class UserAccount extends Component {
  static propTypes = {
    activeComponent: PropTypes.string,

    resetPassword: PropTypes.func
  }
  componentWillMount () {
    this.props.onComponentMount(this.props)
  }
  render () {
    var removeIconStyle = {
      cursor: 'pointer'
    }
    const messages = getComponentMessages('UserAccount')

    const subscriptions = this.props.user.profile.app_metadata.datatools.find(dt => dt.client_id === process.env.AUTH0_CLIENT_ID).subscriptions
    const accountSections = [
      {
        id: 'profile',
        component: (
          <div>
            <Panel header={<h4>Profile information</h4>}>
              <ListGroup fill>
                <ListGroupItem>
                  <ControlLabel>Email address</ControlLabel>
                  <EditableTextField
                    value={this.props.user.profile.email}
                    onChange={(value) => {
                      this.props.updateUserName(this.props.user, value)
                    }}
                  />
                  {/* <Button onClick={() => {this.props.getUser(this.props.user.profile.user_id)}}>Get User</Button> */}
                </ListGroupItem>
                <ListGroupItem>
                  <p><strong>Avatar</strong></p>
                  <a href='http://gravatar.com'>
                    <img className='img-rounded' height={40} width={40} src={this.props.user.profile.picture} />
                    <span style={{marginLeft: '10px'}}>Change on gravatar.com</span>
                  </a>
                </ListGroupItem>
                <ListGroupItem>
                  <p><strong>Password</strong></p>
                  <Button onClick={() => this.props.resetPassword()}>Change password</Button>
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
        component:
          <div>
            <Panel
              header={<h4>Notification methods</h4>}
                    >
              <ListGroup fill>
                <ListGroupItem>
                  <h4>Watching</h4>
                  <p>Receive updates to any feed sources or comments you are watching.</p>
                  <Checkbox inline>Email</Checkbox>{' '}<Checkbox inline>Web</Checkbox>
                </ListGroupItem>
              </ListGroup>
            </Panel>
            <Panel
              header={
                <h4>
                  <Button
                    onClick={() => this.props.unsubscribeAll(this.props.user.profile)}
                    className='pull-right'
                    bsSize='xsmall'
                          >
                    {getMessage(messages, 'notifications.unsubscribeAll')}
                  </Button>
                  {getMessage(messages, 'notifications.subscriptions')}
                </h4>
                      }
                    >
              <ul>
                {subscriptions && subscriptions.length
                  ? subscriptions.map(sub => {
                    return (
                      <li>
                        {sub.type.replace('-', ' ')}{' '}
                        <Icon
                          type='trash'
                          className='text-danger'
                          style={removeIconStyle}
                          onClick={() => { this.props.removeUserSubscription(this.props.user.profile, sub.type) }}
                                />
                        <ul>
                          {sub.target.length
                            ? sub.target.map(target => {
                              let fs = null // this.props.projects ? this.props.projects.reduce(proj => proj.feedSources.filter(fs => fs.id === target)) : null
                              if (this.props.projects) {
                                for (var i = 0; i < this.props.projects.length; i++) {
                                  const feed = this.props.projects[i].feedSources
                                    ? this.props.projects[i].feedSources.find(fs => fs.id === target)
                                    : null
                                  fs = feed || fs
                                }
                              }
                              return (
                                <li>
                                  {
                                    fs ? <Link to={fs.isPublic ? `/public/feed/${fs.id}` : `/feed/${fs.id}`}>{fs.name}</Link>
                                    : <span>{target}</span>
                                  } {' '}
                                  <Icon
                                    type='trash'
                                    className='text-danger'
                                    style={removeIconStyle}
                                    onClick={() => { this.props.updateUserSubscription(this.props.user.profile, target, sub.type) }}
                                  />
                                </li>
                              )
                            })
                            : <li>No feeds subscribed to.</li>
                          }
                        </ul>
                      </li>
                    )
                  })
                  : <li>No subscriptions.</li>
                }
              </ul>
            </Panel>
          </div>
      },
      {
        id: 'billing',
        hidden: !getConfigProperty('modules.enterprise.enabled')
      }
    ]
    const activeSection = accountSections.find(section => section.id === this.props.activeComponent)
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
                  {accountSections.map(section => {
                    if (section.hidden) return null
                    console.log(section.id, messages)
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
