// @flow

import React, {Component} from 'react'
import {FormControl} from 'react-bootstrap'

import {
  convertSecondsToHHMMString,
  convertHHMMStringToSeconds
} from '../../common/util/date-time'

type Props = {
  onChange: (any) => any,
  seconds: number,
  style: {[string]: string | number}
}

type State = {
  string?: string
}

export default class HourMinuteInput extends Component<Props, State> {
  state = {}

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const {onChange} = this.props
    const {value} = evt.target
    const seconds = convertHHMMStringToSeconds(value)
    this.setState({string: value})
    onChange && onChange(seconds)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({string: convertSecondsToHHMMString(nextProps.seconds)})
  }

  render () {
    const {seconds, style, ...otherProps} = this.props
    const {string} = this.state
    return (
      <FormControl
        {...otherProps}
        value={typeof string !== 'undefined' ? string : convertSecondsToHHMMString(seconds)}
        placeholder={'hh:mm'}
        style={style}
        onChange={this._onChange} />
    )
  }
}
