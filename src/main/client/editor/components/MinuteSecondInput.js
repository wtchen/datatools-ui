import React, {Component, PropTypes} from 'react'
import { FormControl } from 'react-bootstrap'

export default class MinuteSecondInput extends Component {

  static propTypes = {
    seconds: PropTypes.number,
    onChange: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      seconds: this.props.seconds
    }
  }
  onChange (value) {
    let seconds = this.convertStringToSeconds(value)
    if (seconds === this.state.seconds) {
      this.setState({string: value})
    }
    else {
      this.setState({seconds, string: value})
      this.props.onChange(seconds)
    }
  }
  convertSecondsToString (seconds) {
    const minutes = Math.floor(seconds / 60)
    const sec = seconds % 60
    return seconds ? `${minutes}:${sec < 10 ? '0' + sec : sec}` : '00:00'
  }
  convertStringToSeconds (string) {
    const minuteSecond = string.split(':')
    console.log(minuteSecond)
    if (!isNaN(minuteSecond[0]) && !isNaN(minuteSecond[1])) {
      return +minuteSecond[0] * 60 + +minuteSecond[1]
    }
    else if (isNaN(minuteSecond[0])) {
      return +minuteSecond[1]
    }
    else if (isNaN(minuteSecond[1])) {
      return +minuteSecond[0] * 60
    }
    else {
      return 0
    }
  }
  render () {
    let seconds = this.state.seconds
    return (
      <FormControl
        value={typeof this.state.string !== 'undefined' ? this.state.string : this.convertSecondsToString(seconds)}
        placeholder={'mm:ss'}
        onChange={(evt) => {
          this.onChange(evt.target.value)
        }}
      />
    )
  }
}
