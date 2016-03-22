import React from 'react'

import { Grid, Row, Col, Button, Table, Input } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'
import EditableTextField from './EditableTextField'
import CurrentStatusMessage from '../containers/CurrentStatusMessage'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.onComponentMount()
  }

  render () {
    console.log("projects", this.props.projects);
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={4}>
              <Input
                type="text"
                placeholder="Search by Project Name"
                onChange={evt => this.props.searchTextChanged(evt.target.value)}
              />
            </Col>
            <Col xs={8}>
              <Button
                bsStyle="primary"
                className="pull-right"
                onClick={() => this.props.onNewProjectClick()}
              >
                New Project
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>&nbsp;</Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Table striped hover>
                <thead>
                  <tr>
                    <th className="col-md-4">Project Name</th>
                    <th className="col-md-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.projects.map((project) => {
                    return (
                      <tr key={project.id}>
                        <td className="col-md-4">
                          <div>
                            <EditableTextField
                              isEditing={(project.isCreating === true)}
                              value={project.name}
                              onChange={(value) => {
                                if(project.isCreating) this.props.newProjectNamed(value)
                                else this.props.projectNameChanged(project, value)
                              }}
                            />
                          </div>
                        </td>
                        <td className="col-md-8">
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Grid>
        <CurrentStatusMessage />
      </div>
    )
  }
}
