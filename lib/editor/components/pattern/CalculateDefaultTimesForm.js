import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { Button, FormGroup, InputGroup, Form, FormControl, ControlLabel } from 'react-bootstrap'

import MinuteSecondInput from '../MinuteSecondInput'
import {straightLineDistancesBetweenStopAnchors} from '../../util/map'

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
    const {activePattern, controlPoints, saveActiveEntity, updateActiveEntity} = this.props
    const {dwellTime, speed} = this.state
    const patternStops = [...activePattern.patternStops]
    const convertedSpeed = speed * 1000 / 60 / 60 // km/hr -> m/s
    const straightLineDistances = straightLineDistancesBetweenStopAnchors(controlPoints)
    for (var i = 0; i < patternStops.length; i++) {
      let interStopDistance = 0
      patternStops[i].defaultDwellTime = dwellTime
      if (i > 0) {
        // Only update travel time for stops after the first stop because the
        // time to travel to the first stop (from the first stop) should be zero.
        if (activePattern.shape) {
          // If there is a pattern shape, use the shape distance traveled values
          interStopDistance = patternStops[i].shapeDistTraveled - patternStops[i - 1].shapeDistTraveled
        } else {
          // Otherwise, use straight line distances between stops (there are
          // only n - 1 distances between n stops, hence the i - 1 for the index).
          interStopDistance = straightLineDistances[i - 1]
        }
      }
      // Never permit the calculation of negative stop distance values (if that
      // were somehow to occur).
      patternStops[i].defaultTravelTime = interStopDistance > 0
        ? Math.floor(interStopDistance / convertedSpeed)
        : 0
      // console.log(interStopDistance, patternStops[i].defaultTravelTime)
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
