import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Button, FormGroup, InputGroup, Form, FormControl, ControlLabel } from 'react-bootstrap'

import MinuteSecondInput from '../MinuteSecondInput'

const DEFAULT_SPEED = 20 // km/hr

export default class CalculateDefaultTimesForm extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    saveActiveEntity: PropTypes.func,
    updateActiveEntity: PropTypes.func
  }

  state = {
    speed: DEFAULT_SPEED,
    dwellTime: 0
  }

  _calculateDefaultTimes = () => {
    const {activePattern, saveActiveEntity, updateActiveEntity} = this.props
    const {dwellTime, speed} = this.state
    const patternStops = [...activePattern.patternStops]
    const convertedSpeed = speed * 1000 / 60 / 60 // km/hr -> m/s
    for (var i = 0; i < patternStops.length; i++) {
      patternStops[i].defaultDwellTime = dwellTime
      if (i > 0) {
        // Only set travel time for stops after the first stop (time to travel to
        // first stop should be zero).
        const interStopDistance = patternStops[i].shapeDistTraveled - patternStops[i - 1].shapeDistTraveled
        patternStops[i].defaultTravelTime = Math.floor(interStopDistance / convertedSpeed)
        console.log(interStopDistance, patternStops[i].defaultTravelTime)
      } else {
        // Set first stop travel time to zero (in case it was previously some
        // other value).
        patternStops[i].defaultTravelTime = 0
      }
    }
    updateActiveEntity(activePattern, 'trippattern', {patternStops})
    saveActiveEntity('trippattern')
  }

  _onDwellTimeChange = (value) => {
    this.setState({dwellTime: value})
  }

  _onSpeedChange = (evt) => {
    this.setState({speed: evt.target.value})
  }

  render () {
    return (
      <Form>
        <FormGroup className={`col-xs-4`} bsSize='small'>
          <ControlLabel>
            <small>
              Dwell time
            </small>
          </ControlLabel>
          <MinuteSecondInput
            seconds={this.state.dwellTime}
            onChange={this._onDwellTimeChange} />
        </FormGroup>
        {'  '}
        <InputGroup
          style={{paddingTop: '25px'}}
          className={`col-xs-8`}
          bsSize='small'>
          <FormControl
            type='number'
            min={1}
            placeholder={`${DEFAULT_SPEED} (km/hr)`}
            onChange={this._onSpeedChange} />
          <InputGroup.Button>
            <Button
              onClick={this._calculateDefaultTimes}
              bsStyle='default'>
              <Icon type='calculator' /> Calc. times
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </Form>
    )
  }
}
