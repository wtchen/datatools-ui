import React from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerPage from './ManagerPage'
import { Link } from 'react-router'
export default class PageNotFound extends React.Component {
  render () {
    return (
      <div>
        <ManagerPage ref='page'>
          <Grid>
            <Row>
              <Col xs={12}>
                <h1>Page Not Found.</h1>
                <p>Go to <Link to='/'>Home Page</Link></p>
              </Col>
            </Row>
          </Grid>
        </ManagerPage>
      </div>
    )
  }
}
