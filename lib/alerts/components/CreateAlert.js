import React from 'react'
import { Button } from 'react-bootstrap'

export default class CreateAlert extends React.Component {
  render () {
    return (
      <Button
        bsStyle='primary'
        bsSize='large'
        style={this.props.style}
        disabled={this.props.disabled != null ? this.props.disabled : false}
        onClick={this.props.createAlert}
        className='pull-right'
      >New Alert</Button>
    )
  }
}
