import React from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

export default class CreateAlert extends React.Component {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <Button
        bsStyle='primary'
        bsSize='large'
        disabled={this.props.disabled != null ? this.props.disabled : false}
        onClick={this.props.createAlert}
        className='pull-right'
      >New Alert</Button>
    )
  }
}
