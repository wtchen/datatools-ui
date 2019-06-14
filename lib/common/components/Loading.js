// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Row, Col } from 'react-bootstrap'

type Props = {
  small?: boolean,
  style?: {[string]: string | number}
}

export default class Loading extends Component<Props> {
  render () {
    const {small, style} = this.props
    const icon = (
      <Icon
        style={style}
        className={`fa-spin ${small ? '' : 'fa-5x'}`}
        type='refresh' />
    )
    return small
      ? icon
      : <Row>
        <Col xs={12}>
          <p className='text-center'>
            {icon}
          </p>
        </Col>
      </Row>
  }
}
