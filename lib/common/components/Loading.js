// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Row, Col } from 'react-bootstrap'

type Props = {
  style?: {[string]: string | number}
}

export default class Loading extends Component<Props> {
  render () {
    const {style} = this.props
    return (
      <Row>
        <Col xs={12}>
          <p className='text-center'>
            <Icon style={style} className='fa-5x fa-spin' type='refresh' />
          </p>
        </Col>
      </Row>
    )
  }
}
