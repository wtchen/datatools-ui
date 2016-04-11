import React from 'react'
import moment from 'moment'
import { Grid, Row, Col, Button, Table, Input, Panel, Glyphicon, Badge, ButtonInput, form } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'

import EditableTextField from '../../common/components/EditableTextField'
import PublicPage from './PublicPage'

export default class UserAccount extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  render () {
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
                  this.props.updateUser(this.props.user.profile.user_id, {
                    "permissions": [
                      {
                        "type": "administer-application"
                      }
                    ],
                    "projects": []
                  })
                }}
              />
              <Button onClick={() => {this.props.getUser(this.props.user.profile.user_id)}}>Get User</Button>
            </Col>
          </Row>
        </Grid>
      </PublicPage>
    )
  }
}
