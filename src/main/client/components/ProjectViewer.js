import React from 'react'

import { Grid, Row, Col, Button, Table, Input, Panel } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props.routeParams.projectId)
  }

  render () {
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={12}>
              <h2>{this.props.project.name}</h2>
            </Col>
          </Row>

          <Panel
            header={(<b>Project Settings</b>)}
            collapsible
          >
            <Row>
              <Col xs={12}>
                Settings
              </Col>
            </Row>
          </Panel>

          <Panel
            header={(<b>Feed Sources</b>)}
            collapsible
            defaultExpanded={true}
          >
            <Row>
              <Col xs={4}>
                <Input
                  type="text"
                  placeholder="Search by Feed Source Name"
                  onChange={evt => this.props.searchTextChanged(evt.target.value)}
                />
              </Col>
              <Col xs={8}>
                <Button
                  bsStyle="primary"
                  className="pull-right"
                  onClick={() => this.props.onNewProjectClick()}
                >
                  New Feed Source
                </Button>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th className='col-md-4'>Name</th>
                      <th>Public?</th>
                      <th>Retrieval Method</th>
                      <th>Last Updated</th>
                      <th>Error<br/>Count</th>
                      <th>Valid Range</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Panel>
        </Grid>
      </div>
    )
  }
}
