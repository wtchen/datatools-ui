import React, {PropTypes, Component} from 'react'
import {Button, OverlayTrigger} from 'react-bootstrap'

export default class OptionButton extends Component {
  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func,
    value: PropTypes.any.isRequired
  }

  _onClick = () => {
    const {active, onClick, value} = this.props
    if (!active) {
      onClick && onClick(value)
    }
  }

  render () {
    const {children, tooltip} = this.props
    const button = (
      <Button
        {...this.props}
        href='#' // required for button width to appear correctly
        onClick={this._onClick}>
        {children}
      </Button>
    )
    if (tooltip) {
      return (
        <OverlayTrigger
          placement='bottom'
          overlay={tooltip}>
          {button}
        </OverlayTrigger>
      )
    } else {
      return button
    }
  }
}
