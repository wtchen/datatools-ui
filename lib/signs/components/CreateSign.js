import React from 'react'
import { Button } from 'react-bootstrap'

export default class CreateAlert extends React.Component {
  render () {
    return (
      <Button
        bsStyle='primary'
        bsSize='large'
        disabled={this.props.disabled != null ? this.props.disabled : false}
        onClick={this.props.createSign}
        className='pull-right'
      >New Configuration</Button>
    )
  }
}
