import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, FormGroup, InputGroup, Form, FormControl, ControlLabel } from 'react-bootstrap'

import MinuteSecondInput from '../MinuteSecondInput'

const DEFAULT_SPEED = 20 // km/hr

export default class CalculateDefaultTimesForm extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  calculateDefaultTimes (pattern, speed = DEFAULT_SPEED, dwellTime = 0) {
    if (!speed) {
      speed = DEFAULT_SPEED
    }
    const patternStops = [...pattern.patternStops]
    const convertedSpeed = speed * 1000 / 60 / 60 // km/hr -> m/s
    for (var i = 0; i < patternStops.length; i++) {
      patternStops[i].defaultDwellTime = dwellTime
      patternStops[i].defaultTravelTime = patternStops[i].shapeDistTraveled / convertedSpeed
    }
    this.props.updateActiveEntity(pattern, 'trippattern', {patternStops})
    this.props.saveActiveEntity('trippattern')
  }
  render () {
    const { activePattern } = this.props
    return (
      <Form>
        <FormGroup className={`col-xs-4`} bsSize='small'>
          <ControlLabel><small>Dwell time</small></ControlLabel>
          <MinuteSecondInput
            seconds={this.state.dwellTime}
            // style={{width: '60px'}}
            onChange={(value) => {
              this.setState({dwellTime: value})
            }}
          />
        </FormGroup>
        {'  '}
        <InputGroup
          style={{paddingTop: '25px'}}
          className={`col-xs-8`}
          bsSize='small'
        >
          <FormControl
            type='number'
            min={1}
            placeholder={`${DEFAULT_SPEED} (km/hr)`}
            onChange={(evt) => {
              this.setState({speed: evt.target.value})
            }}
          />
          <InputGroup.Button>
            <Button
              onClick={() => {
                this.calculateDefaultTimes(activePattern, this.state.speed, this.state.dwellTime)
              }}
              bsStyle='default'
            >
              <Icon type='calculator' /> Calc. times
            </Button>
          </InputGroup.Button>
        </InputGroup>
      </Form>
    )
  }
}
