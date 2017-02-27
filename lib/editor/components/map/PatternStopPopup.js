import React, { Component } from 'react'
import { Button, Dropdown, OverlayTrigger, Tooltip, Row, Col, ButtonGroup, MenuItem, FormGroup, ControlLabel } from 'react-bootstrap'
import { Icon } from '@conveyal/woonerf'

import MinuteSecondInput from '../MinuteSecondInput'

export default class PatternStopPopup extends Component {
  render () {
    const { stop, index, patternStop, activePattern, entityEdited, saveActiveEntity, setActiveEntity, feedSource, removeStopFromPattern, addStopToPattern, updateActiveEntity, controlPoints } = this.props
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
                  disabled={index >= activePattern.patternStops.length - 2}
                  onClick={(e) => {
                    addStopToPattern(activePattern, stop)
                  }}
                >
                  <Icon type='plus' />
                </Button>
                <Dropdown.Toggle bsStyle='success' />
                <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
                  <MenuItem
                    disabled={index >= activePattern.patternStops.length - 1}
                    value={activePattern.patternStops.length}
                    eventKey={activePattern.patternStops.length}>
                    Add to end (default)
                  </MenuItem>
                  {activePattern.patternStops && activePattern.patternStops.map((stop, i) => {
                    // addIndex is in "reverse" order
                    const addIndex = activePattern.patternStops.length - i
                    // skip MenuItem index is the same as the pattern stop index
                    if (index === addIndex - 1) {
                      return null
                    }
                    // disable adding stop to current position or directly before/after current position
                    return (
                      <MenuItem
                        disabled={index >= addIndex - 2 && index < addIndex}
                        value={addIndex - 1}
                        key={i}
                        eventKey={addIndex - 1}
                      >
                        {`Insert as stop #${addIndex}`}
                      </MenuItem>
                    )
                  })}
                  <MenuItem
                    disabled={index === 0}
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
