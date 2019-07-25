// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Row, Col } from 'react-bootstrap'

type Props = {}

export default class Loading extends Component<Props> {
  render () {
    return (
      <Row>
        <Col xs={12}>
          <p className='text-center'>
            <Icon className='fa-5x fa-spin' type='refresh' />
          </p>
        </Col>
      </Row>
    )
  }
}
