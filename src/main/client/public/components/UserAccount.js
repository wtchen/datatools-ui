import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import EditableTextField from '../../common/components/EditableTextField'
import PublicPage from './PublicPage'
import { getConfigProperty } from '../../common/util/config'

export default class UserAccount extends React.Component {

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
    let subscriptions = this.props.user.profile.app_metadata.datatools.find(dt => dt.client_id === getConfigProperty('auth0.client_id')).subscriptions
    return (
      <PublicPage ref='publicPage'>
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>
                My Account &nbsp;&nbsp;&nbsp;
                <LinkContainer to={{ pathname: '/project' }}>
                  <Button>View my Projects</Button>
                </LinkContainer>
              </h2>
            </Col>
          </Row>

          <Row>
            <Col xs={4}>
              <h3>User info</h3>
              <EditableTextField
                value={this.props.user.profile.email}
                onChange={(value) => {
                  this.props.updateUserName(this.props.user, value)
                }}
              />
              <Button onClick={() => {this.props.getUser(this.props.user.profile.user_id)}}>Get User</Button>
            </Col>
            { getConfigProperty('application.notifications_enabled') ?
              <Col xs={4}>
                <h3>My Subscriptions</h3>
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
              </Col>
              : ''
            }
          </Row>
        </Grid>
      </PublicPage>
    )
  }
}
