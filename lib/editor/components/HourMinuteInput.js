// @flow

import React, {Component} from 'react'
import {FormControl} from 'react-bootstrap'

type Props = {
  onChange: (number) => any,
  seconds: number,
  style: {[string]: string | number}
}

type State = {
  hours?: number,
  minutes?: number
}

export default class HourMinuteInput extends Component<Props, State> {
  state = {}

  _onChange = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const {id, value} = evt.target
    const {data: key} = evt.nativeEvent

    if (isNaN(parseInt(key))) {
      return
    }
    if (id !== 'hours' && id !== 'minutes') {
      return
    }

    this.setState({[id]: value}, this.handleChange)
  }

  _onFocus = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    evt.target.select()
  }

  handleChange = () => {
    const {onChange} = this.props

    const {hours, minutes} = this.state
    onChange && onChange(((hours || 0) * 3600) + ((minutes || 0) * 60))
  }

  componentDidUpdate (prevProps: Props) {
    const {seconds} = this.props
    if (seconds !== prevProps.seconds) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor(seconds / 60 % 60)

      this.setState({minutes, hours})
    }
  }

  render () {
    const {seconds: initialSeconds, style, ...otherProps} = this.props
    const {hours, minutes} = this.state

    return (
      <span style={{display: 'flex', alignItems: 'baseline'}}>
        <FormControl
          {...otherProps}
          id='hours'
          onChange={this._onChange}
          onFocus={this._onFocus}
          placeholder={'hh'}
          style={style}
          value={hours && hours < 10 ? `0${hours}` : hours || '00'}
        />
         :
        <FormControl
          {...otherProps}
          id='minutes'
          onChange={this._onChange}
          onFocus={this._onFocus}
          placeholder={'mm'}
          style={style}
          value={minutes && minutes < 10 ? `0${minutes}` : minutes || '00'}
        />
      </span>
    )
  }
}
