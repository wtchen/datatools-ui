import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import { Grid, Row, Col, Button, Table, Input, Panel, ListGroup, ListGroupItem, Glyphicon, Badge, ButtonInput, ControlLabel } from 'react-bootstrap'
import { Link } from 'react-router'
import Icon from 'react-fa'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import EditableTextField from '../../common/components/EditableTextField'
import ManagerPage from '../../common/components/ManagerPage'
import { getConfigProperty, getComponentMessages, getMessage } from '../../common/util/config'

export default class UserAccount extends Component {
  static propTypes = {
    activeComponent: PropTypes.string
  }
  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
    var removeIconStyle = {
      color: 'red',
      cursor: 'pointer'
    }
    const messages = getComponentMessages('UserAccount')

    let subscriptions = this.props.user.profile.app_metadata.datatools.find(dt => dt.client_id === getConfigProperty('auth0.client_id')).subscriptions
    const accountSections = [
      {
        id: 'profile',
        component: <div>
                    <Panel header={<h4>Profile information</h4>}>
                      <ControlLabel>Email address</ControlLabel>
                      <EditableTextField
                        value={this.props.user.profile.email}
                        onChange={(value) => {
                          this.props.updateUserName(this.props.user, value)
                        }}
                      />
                      {/* <Button onClick={() => {this.props.getUser(this.props.user.profile.user_id)}}>Get User</Button> */}
                      </Panel>
                  </div>
      },
      {
        id: 'account'
      },
      {
        id: 'organizations'
      },
      {
        id: 'notifications',
        hidden: !getConfigProperty('application.notifications_enabled'),
        component: <Panel header={<h4>{getMessage(messages, 'notifications.subscriptions')}</h4>}>
          <ul>
            {subscriptions.length ? subscriptions.map(sub => {
              return (
                <li>
                  {sub.type.replace('-', ' ')} &nbsp;
                    <Glyphicon
                      glyph='remove'
                      style={removeIconStyle}
                      onClick={() => { this.props.removeUserSubscription(this.props.user.profile, sub.type) }}
                    />
                  <ul>
                    {sub.target.length ? sub.target.map(target => {
                      let fs = null // this.props.projects ? this.props.projects.reduce(proj => proj.feedSources.filter(fs => fs.id === target)) : null
                      if (this.props.projects) {
                        for (var i = 0; i < this.props.projects.length; i++) {
                          let feed = this.props.projects[i].feedSources ? this.props.projects[i].feedSources.find(fs => fs.id === target) : null
                          fs = feed ? feed : fs
                        }
                      }
                      return (
                        <li>
                          {
                            fs ? <Link to={fs.isPublic ? `/public/feed/${fs.id}` : `/feed/${fs.id}`}>{fs.name}</Link>
                            :
                            <span>{target}</span>
                          } &nbsp;
                          <Glyphicon
                            glyph='remove'
                            style={removeIconStyle}
                            onClick={() => { this.props.updateUserSubscription(this.props.user.profile, target, sub.type) }}
                          />
                        </li>
                      )
                    }) : <li>No feeds subscribed to.</li>
                  }
                  </ul>
                </li>
              )
            })
            : <li>No subscriptions.</li>
          }
          </ul>
        </Panel>
      },
      {
        id: 'billing'
      }
    ]
    const activeSection = accountSections.find(section => section.id === this.props.activeComponent)
    const visibleComponent = activeSection ? activeSection.component : null
    return (
      <ManagerPage ref='page'>
        <Grid>
          <Row style={{marginBottom: '20px'}}>
            <Col xs={12}>
              <h1>
                <LinkContainer className='pull-right' to={{ pathname: '/home' }}>
                  <Button>Back to dashboard</Button>
                </LinkContainer>
                <Icon name='user'/> My settings
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
                      <LinkContainer key={project.id} to={`/project/${project.id}`}>
                        <ListGroupItem active={this.props.projectId === project.id}>
                          {project.name}
                        </ListGroupItem>
                      </LinkContainer>
                    )
                  })}
                </ListGroup>
              </Panel>
            </Col>
            <Col xs={1}></Col>
            <Col xs={6}>
              {visibleComponent}
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
