import React from 'react'
import { Row, Col } from 'react-bootstrap'
import Icon from '@conveyal/woonerf'


export default class Loading extends React.Component {

  render () {
    return (
      <Row>
        <Col xs={12}>
          <p className='text-center'><Icon size='5x' spin name='refresh' /></p>
        </Col>
      </Row>
    )
  }
}
