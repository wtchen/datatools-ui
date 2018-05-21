import React, {Component, PropTypes} from 'react'
import {FormControl} from 'react-bootstrap'

export default class HourMinuteInput extends Component {
  static propTypes = {
    seconds: PropTypes.number,
    onChange: PropTypes.func,
    style: PropTypes.object
  }

  state = {}

  _onChange = (evt) => {
    const {onChange} = this.props
    const {value} = evt.target
    const seconds = this.convertStringToSeconds(value)
    this.setState({string: value})
    onChange && onChange(seconds)
  }

  componentWillReceiveProps (nextProps) {
    this.setState({string: this.convertSecondsToString(nextProps.seconds)})
  }

  convertSecondsToString (seconds) {
    const hours = Math.floor(seconds / 60 / 60)
    const minutes = Math.floor(seconds / 60) % 60
    return seconds ? `${hours}:${minutes < 10 ? '0' + minutes : minutes}` : '00:00'
  }

  convertStringToSeconds (string) {
    const hourMinute = string.split(':')
    if (!isNaN(hourMinute[0]) && !isNaN(hourMinute[1])) {
      // If both hours and minutes are present
      return (Math.abs(+hourMinute[0]) * 60 * 60) + (Math.abs(+hourMinute[1]) * 60)
    } else if (isNaN(hourMinute[0])) {
      // If less than one hour
      return Math.abs(+hourMinute[1]) * 60
    } else if (isNaN(hourMinute[1])) {
      // If minutes are not present
      return Math.abs(+hourMinute[0]) * 60 * 60
    } else {
      // If no input
      return 0
    }
  }

  render () {
    const {seconds, style, ...otherProps} = this.props
    const {string} = this.state
    return (
      <FormControl
        {...otherProps}
        value={typeof string !== 'undefined' ? string : this.convertSecondsToString(seconds)}
        placeholder={'hh:mm'}
        style={style}
        onChange={this._onChange} />
    )
  }
}
