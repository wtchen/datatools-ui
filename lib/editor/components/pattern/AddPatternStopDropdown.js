// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import { Button, Dropdown, MenuItem } from 'react-bootstrap'

import * as stopStrategiesActions from '../../actions/map/stopStrategies'

import type {GtfsStop, Pattern, PatternStop, Style} from '../../../types'

type Props = {
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  index?: number, // current pattern stop index (if dropdown shown for current pattern stop)
  label?: string,
  patternStop?: PatternStop, // optional current pattern stop
  size?: string,
  stop: GtfsStop,
  style?: Style
}

const DISABLED_MESSAGE = 'Cannot have the same stop appear consecutively in list'

/**
 * Dropdown button that adds a stop as a new pattern stop to the actively
 * selected pattern.
 */
export default class AddPatternStopDropdown extends Component<Props> {
  _addStop = (index?: number) => {
    const {activePattern, addStopToPattern, stop} = this.props
    addStopToPattern(activePattern, stop, index)
  }

  _matchesStopAtIndex = (index: number) => {
    const {activePattern, stop} = this.props
    const patternStopAtIndex = activePattern.patternStops[index]
    return patternStopAtIndex && patternStopAtIndex.stopId === stop.stop_id
  }

  _onAddToEnd = () => this._addStop()

  _onSelectStop = (key: number) => this._addStop(key)

  render () {
    const {activePattern, index, label, size, style} = this.props
    const {patternStops} = activePattern
    const lastIndex = patternStops.length - 1
    // Check that first/last stop is not already set to this stop.
    let addToEndDisabled = this._matchesStopAtIndex(lastIndex)
    let addToBeginningDisabled = this._matchesStopAtIndex(0)
    // Also, disable end/beginning if the current pattern stop being viewed
    // occupies one of these positions.
    if (typeof index === 'number') {
      addToEndDisabled = addToEndDisabled || index >= lastIndex
      addToBeginningDisabled = addToBeginningDisabled || index === 0
    }
    return (
      <Dropdown
        id={`add-stop-dropdown`}
        pullRight
        onSelect={this._onSelectStop}
        style={style}
      >
        <Button
          bsSize={size}
          bsStyle='success'
          disabled={addToEndDisabled}
          title={addToEndDisabled ? DISABLED_MESSAGE : ''}
          onClick={this._onAddToEnd}>
          <Icon type='plus' /> {label}
        </Button>
        <Dropdown.Toggle
          bsSize={size}
          bsStyle='success' />
        <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
          <MenuItem
            disabled={addToEndDisabled}
            title={addToEndDisabled ? DISABLED_MESSAGE : ''}
            value={activePattern.patternStops.length}
            eventKey={activePattern.patternStops.length}>
            Add to end (default)
          </MenuItem>
          {activePattern.patternStops && activePattern.patternStops.map((s, i) => {
            // addIndex is in "reverse" order
            const addIndex = activePattern.patternStops.length - i
            let disableAdjacent = false
            // If showing for current pattern stop, do not allow adding as an
            // adjacent stop.
            if (typeof index === 'number') {
              disableAdjacent = (index >= addIndex - 2 && index < addIndex)
            }
            // Disable adding stop to current position or directly before/after
            // current position
            const addAtIndexDisabled = disableAdjacent ||
              this._matchesStopAtIndex(addIndex - 2) ||
              this._matchesStopAtIndex(addIndex - 1)
            // Skip MenuItem index is the same as the pattern stop index
            if (index === addIndex - 1 || addIndex === 1) {
              return null
            }
            return (
              <MenuItem
                disabled={addAtIndexDisabled}
                value={addIndex - 1}
                title={addAtIndexDisabled ? DISABLED_MESSAGE : ''}
                key={i}
                eventKey={addIndex - 1}>
                {`Insert as stop #${addIndex}`}
              </MenuItem>
            )
          })}
          <MenuItem
            disabled={addToBeginningDisabled}
            title={addToBeginningDisabled ? DISABLED_MESSAGE : ''}
            value={0}
            eventKey={0}>
            Add to beginning
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
