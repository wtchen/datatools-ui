import Icon from '@conveyal/woonerf/components/icon'
import { divIcon } from 'leaflet'
import React, {Component, PropTypes} from 'react'
import {Marker, Popup} from 'react-leaflet'
import { Button, Dropdown, OverlayTrigger, Tooltip, Row, Col, ButtonGroup, MenuItem, FormGroup, ControlLabel } from 'react-bootstrap'

import MinuteSecondInput from '../MinuteSecondInput'

export default class PatternStopMarker extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    addStopToPattern: PropTypes.func,
    controlPoints: PropTypes.array,
    entityEdited: PropTypes.bool,
    feedSource: PropTypes.object,
    index: PropTypes.number,
    patternStop: PropTypes.object,
    removeStopFromPattern: PropTypes.func,
    saveActiveEntity: PropTypes.func,
    setActiveEntity: PropTypes.func,
    stop: PropTypes.object,
    updateActiveEntity: PropTypes.func
  }

  _onAddToEnd = (e) => this.props.addStopToPattern(this.props.activePattern, this.props.stop)

  _onChangeDwellTime = (value) => {
    const {activePattern, index, updateActiveEntity} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops[index].defaultDwellTime = value
    updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
  }

  _onChangeTravelTime = (value) => {
    const {activePattern, index, updateActiveEntity} = this.props
    const patternStops = [...activePattern.patternStops]
    patternStops[index].defaultTravelTime = value
    updateActiveEntity(activePattern, 'trippattern', {patternStops: patternStops})
  }

  _onClick = () => {
    const {active, setActiveStop} = this.props
    const {id} = this.props.patternStop
    if (!active) setActiveStop({id})
    else setActiveStop({id: null})
  }

  _onClickEdit = () => this.props.setActiveEntity(this.props.feedSource.id, 'stop', this.props.stop)

  _onClickRemove = () => this.props.removeStopFromPattern(this.props.activePattern, this.props.stop, this.props.index, this.props.controlPoints)

  _onClickSave = () => this.props.saveActiveEntity('trippattern')

  _onSelectStop = (key) => this.props.addStopToPattern(this.props.activePattern, this.props.stop, key)

  render () {
    const {active, stop, index, patternStop, activePattern, entityEdited} = this.props
    const stopName = `${index + 1}. ${stop.stop_name} (${stop.stop_code ? stop.stop_code : stop.stop_id})`
    const MARKER_SIZE = 24 // active ? 30 : 24
    const patternStopIcon = divIcon({
      html: `<span title="${stopName}" class="fa-stack">
              <i class="fa fa-circle fa-stack-2x" style="opacity: 0.8; ${active ? 'color: blue' : ''}"></i>
              <strong class="fa-stack-1x fa-inverse calendar-text">${index + 1}</strong>
            </span>`,
      className: '',
      iconSize: [MARKER_SIZE, MARKER_SIZE]
      // iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2]
    })
    const {patternStops} = activePattern
    const lastIndex = patternStops.length - 1
    const addToEndDisabled = index >= lastIndex || patternStops[lastIndex].stopId === stop.id
    const addToBeginningDisabled = index === 0 || patternStops[0].stopId === stop.id
    return (
      <Marker
        position={[stop.stop_lat, stop.stop_lon]}
        onClick={this._onClick}
        zIndexOffset={active ? 1000 : 0}
        icon={patternStopIcon}>
        <Popup>
          <div // popup requires single child (i.e., single div)
            style={{minWidth: '240px'}}>
            <h5>{stopName}</h5>
            <Row>
              <Col xs={12}>
                <ButtonGroup className='pull-right' style={{display: 'inline-block'}}>
                  <Button
                    bsSize='small'
                    bsStyle='primary'
                    disabled={!entityEdited}
                    onClick={this._onClickSave}>
                    <Icon type='floppy-o' />
                  </Button>
                  <OverlayTrigger overlay={<Tooltip id='edit-stop-tooltip'>Edit stop</Tooltip>}>
                    <Button
                      bsSize='small'
                      onClick={this._onClickEdit}>
                      <Icon type='pencil' />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip id='remove-stop-tooltip'>Remove from pattern</Tooltip>}>
                    <Button
                      bsSize='small'
                      bsStyle='danger'
                      onClick={this._onClickRemove}>
                      <Icon type='trash' />
                    </Button>
                  </OverlayTrigger>
                  <Dropdown
                    id={`add-stop-dropdown`}
                    onSelect={this._onSelectStop}>
                    <Button
                      bsSize='small'
                      bsStyle='success'
                      disabled={addToEndDisabled}
                      onClick={this._onAddToEnd}>
                      <Icon type='plus' />
                    </Button>
                    <Dropdown.Toggle
                      bsSize='small'
                      bsStyle='success' />
                    <Dropdown.Menu
                      style={{maxHeight: '200px', overflowY: 'scroll'}}>
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
                            eventKey={addIndex - 1}>
                            {`Insert as stop #${addIndex}`}
                          </MenuItem>
                        )
                      })}
                      <MenuItem
                        disabled={addToBeginningDisabled}
                        value={0}
                        eventKey={0}>
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
                    onChange={this._onChangeTravelTime} />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup
                  controlId='defaultDwellTime'>
                  <ControlLabel>Dwell time</ControlLabel>
                  <MinuteSecondInput
                    seconds={patternStop.defaultDwellTime}
                    onChange={this._onChangeDwellTime} />
                </FormGroup>
              </Col>
            </Row>
          </div>
        </Popup>
      </Marker>
    )
  }
}
