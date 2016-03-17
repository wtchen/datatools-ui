import React from 'react'

import { Grid, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={12}>
              <Button>New Project</Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {this.props.projects.isFetching
                ? <p>Loading projects...</p>
                : this.props.projects.all.map((project) => {
                  return <div key={project.id}>
                    <Link to={`/project/${project.id}`}>{project.name}</Link>
                  </div>
                })
              }
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
