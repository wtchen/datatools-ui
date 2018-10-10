// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button, Dropdown, OverlayTrigger, Tooltip, ButtonGroup, MenuItem } from 'react-bootstrap'

import type {Feed, GtfsStop, Pattern, PatternStop} from '../../../types'

type Props = {
  activePattern: Pattern,
  addStopToPattern: (Pattern, GtfsStop, ?number) => void,
  feedSource: Feed,
  index: number,
  patternEdited: boolean,
  patternStop: PatternStop,
  removeStopFromPattern: (Pattern, GtfsStop, number) => void,
  saveActiveEntity: (string) => void,
  setActiveEntity: (string, string, GtfsStop) => void,
  setActiveStop: ({id: ?any, index: ?number}) => void,
  size: string,
  stop: GtfsStop,
  style?: {[string]: number | string},
  updatePatternStops: (Pattern, Array<PatternStop>) => void
}

export default class PatternStopButtons extends Component<Props> {
  static defaultProps = {
    size: 'small'
  }

  _onAddToEnd = () => {
    const {activePattern, addStopToPattern, stop} = this.props
    addStopToPattern(activePattern, stop)
  }

  _onClickEdit = () => {
    const {feedSource, setActiveEntity, stop} = this.props
    setActiveEntity(feedSource.id, 'stop', stop)
  }

  _onClickRemove = () => {
    const {activePattern, index, removeStopFromPattern, stop} = this.props
    removeStopFromPattern(activePattern, stop, index)
  }

  _onClickSave = () => this.props.saveActiveEntity('trippattern')

  _onSelectStop = (key: number) => {
    const {activePattern, addStopToPattern, stop} = this.props
    addStopToPattern(activePattern, stop, key)
  }

  render () {
    const {stop, index, activePattern, patternEdited, style, size} = this.props
    const {patternStops} = activePattern
    const lastIndex = patternStops.length - 1
    const addToEndDisabled = index >= lastIndex || patternStops[lastIndex].stopId === stop.id
    const addToBeginningDisabled = index === 0 || patternStops[0].stopId === stop.id
    return (
      <ButtonGroup
        className='pull-right'
        style={{
          display: 'inline-block',
          ...style
        }}>
        <Button
          bsSize={size}
          bsStyle='primary'
          disabled={!patternEdited}
          onClick={this._onClickSave}>
          <Icon type='floppy-o' />
        </Button>
        <OverlayTrigger overlay={<Tooltip id='edit-stop-tooltip'>Edit stop</Tooltip>}>
          <Button
            bsSize={size}
            onClick={this._onClickEdit}>
            <Icon type='pencil' />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger overlay={<Tooltip id='remove-stop-tooltip'>Remove from pattern</Tooltip>}>
          <Button
            bsSize={size}
            bsStyle='danger'
            onClick={this._onClickRemove}>
            <Icon type='trash' />
          </Button>
        </OverlayTrigger>
        <Dropdown
          id={`add-stop-dropdown`}
          pullRight
          onSelect={this._onSelectStop}>
          <Button
            bsSize={size}
            bsStyle='success'
            disabled={addToEndDisabled}
            onClick={this._onAddToEnd}>
            <Icon type='plus' />
          </Button>
          <Dropdown.Toggle
            bsSize={size}
            bsStyle='success' />
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
    )
  }
}
