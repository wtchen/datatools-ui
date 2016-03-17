import React from 'react'

import { Grid, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router'

import ManagerNavbar from '../containers/ManagerNavbar'

export default class ProjectsList extends React.Component {

  constructor (props) {
    super(props)
  }

  render () {
    console.log('proj props', this.props)
    return (
      <div>
        <ManagerNavbar />
        <Grid>
          <Row>
            <Col xs={12}>
              Project!
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
