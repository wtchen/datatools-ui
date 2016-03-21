import React from 'react'

import { Grid, Row, Col, Button, Table } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'
import EditableTextField from './EditableTextField'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  componentWillMount () {
    console.log("projList mount");
    this.props.onComponentMount()
  }

  render () {
    console.log("projects", this.props.projects);
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={12}>
              <Button bsStyle="primary">New Project</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>&nbsp;</Col>
          </Row>
          <Row>
            <Col xs={12}>
              {this.props.projects.isFetching
                ? <p>Loading projects...</p>
                : <Table striped hover>
                    <thead>
                      <tr>
                        <th className="col-md-4">Project Name</th>
                        <th className="col-md-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.props.projects.all.map((project) => {
                        return (
                          <tr key={project.id}>
                            <td className="col-md-4">
                              <div>
                                <EditableTextField
                                  value={project.name}
                                  onChange={(value) => this.props.projectNameChanged(project, value)}
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
              }
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
