// @flow

import React, {Component} from 'react'
import {FormControl} from 'react-bootstrap'

import {convertSecondsToString, convertStringToSeconds} from '../../common/util/date-time'

type Props = {
  seconds: number,
  onChange: (any) => void,
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
    const seconds = convertStringToSeconds(value)
    this.setState({string: value})
    onChange && onChange(seconds)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({string: convertSecondsToString(nextProps.seconds)})
  }

  render () {
    const {seconds, style, ...otherProps} = this.props
    const {string} = this.state
    return (
      <FormControl
        {...otherProps}
        value={typeof string !== 'undefined' ? string : convertSecondsToString(seconds)}
        placeholder={'hh:mm'}
        style={style}
        onChange={this._onChange} />
    )
  }
}
