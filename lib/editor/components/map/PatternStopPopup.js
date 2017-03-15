import Icon from '@conveyal/woonerf/components/icon'
import React, { Component } from 'react'
import { Button, Dropdown, OverlayTrigger, Tooltip, Row, Col, ButtonGroup, MenuItem, FormGroup, ControlLabel } from 'react-bootstrap'

import MinuteSecondInput from '../MinuteSecondInput'

export default class PatternStopPopup extends Component {
  render () {
    console.log(this.props)
    const { stop, index, patternStop, activePattern, entityEdited, saveActiveEntity, setActiveEntity, feedSource, removeStopFromPattern, addStopToPattern, updateActiveEntity, controlPoints } = this.props
    const {patternStops} = activePattern
    const lastIndex = patternStops.length - 1
    const addToEndDisabled = index >= lastIndex || patternStops[lastIndex].stopId === stop.id
    const addToBeginningDisabled = index === 0 || patternStops[0].stopId === stop.id
    return (
      <div
        style={{minWidth: '240px'}} // keep button group from separating
      >
        <h5>{index + 1}. {stop.stop_name}</h5>
        <Row>
          <Col xs={12}>
            <ButtonGroup className='pull-right'>
              <Button
                bsStyle='primary'
                disabled={!entityEdited}
                onClick={() => {
                  saveActiveEntity('trippattern')
                }}
              >
                <Icon type='floppy-o' />
              </Button>
              <OverlayTrigger overlay={<Tooltip id='edit-stop-tooltip'>Edit stop</Tooltip>}>
                <Button
                  onClick={() => {
                    setActiveEntity(feedSource.id, 'stop', stop)
                  }}
                >
                  <Icon type='pencil' />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger overlay={<Tooltip id='remove-stop-tooltip'>Remove from pattern</Tooltip>}>
                <Button
                  bsStyle='danger'
                  onClick={() => {
                    removeStopFromPattern(activePattern, stop, index, controlPoints)
                  }}
                >
                  <Icon type='trash' />
                </Button>
              </OverlayTrigger>
              <Dropdown
                id={`add-stop-dropdown`}
                onSelect={(key) => addStopToPattern(activePattern, stop, key)}
              >
                <Button
                  bsStyle='success'
                  disabled={addToEndDisabled}
                  onClick={(e) => {
                    addStopToPattern(activePattern, stop)
                  }}
                >
                  <Icon type='plus' />
                </Button>
                <Dropdown.Toggle bsStyle='success' />
                <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
                  <MenuItem
                    disabled={addToEndDisabled}
                    value={activePattern.patternStops.length}
                    eventKey={activePattern.patternStops.length}>
                    Add to end (default)
                  </MenuItem>
                  {activePattern.patternStops && activePattern.patternStops.map((s, i) => {
                    // addIndex is in "reverse" order
                    const addIndex = activePattern.patternStops.length - i
                    const addAtIndexDisabled = (index >= addIndex - 2 && index < addIndex) ||
                      (patternStops[addIndex - 2] && patternStops[addIndex - 2].stopId === stop.id) ||
                      (patternStops[addIndex - 1] && patternStops[addIndex - 1].stopId === stop.id)
                      // (patternStops[addIndex + 1] && patternStops[addIndex + 1].stopId === stop.id)
                    // skip MenuItem index is the same as the pattern stop index
                    if (index === addIndex - 1 || addIndex === 1) {
                      return null
                    }
                    // disable adding stop to current position or directly before/after current position
                    return (
                      <MenuItem
                        disabled={addAtIndexDisabled}
                        value={addIndex - 1}
                        title={addAtIndexDisabled ? `Cannot have the same stop appear consecutively in list` : ''}
                        key={i}
                        eventKey={addIndex - 1}
                      >
                        {`Insert as stop #${addIndex}`}
                      </MenuItem>
                    )
                  })}
                  <MenuItem
                    disabled={addToBeginningDisabled}
                    value={0}
                    eventKey={0}
                  >
                    Add to beginning
                  </MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <FormGroup
              controlId='defaultTravelTime'>
              <ControlLabel>Travel time</ControlLabel>
              <MinuteSecondInput
                seconds={patternStop.defaultTravelTime}
                onChange={(value) => {
                  const patternStops = [...activePattern.patternStops]
                  patternStops[index].defaultTravelTime = value
                  updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                }}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup
              controlId='defaultDwellTime'>
              <ControlLabel>Dwell time</ControlLabel>
              <MinuteSecondInput
                seconds={patternStop.defaultDwellTime}
                onChange={(evt) => {
                  const patternStops = [...activePattern.patternStops]
                  patternStops[index].defaultDwellTime = +evt.target.value
                  updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
                }}
              />
            </FormGroup>
          </Col>
        </Row>
      </div>
    )
  }
}
