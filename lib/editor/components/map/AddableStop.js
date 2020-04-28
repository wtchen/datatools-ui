// @flow

import Icon from '../../../common/components/icon'
import { divIcon } from 'leaflet'
import React, {Component} from 'react'
import {Button, Dropdown, MenuItem} from 'react-bootstrap'
import {Marker, Popup} from 'react-leaflet'

import * as stopStrategiesActions from '../../actions/map/stopStrategies'

import type {GtfsStop, Pattern} from '../../../types'

type Props = {
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  stop: GtfsStop
}

export default class AddableStop extends Component<Props> {
  _onClickAddStopToEnd = () => {
    const {activePattern, addStopToPattern, stop} = this.props
    addStopToPattern(activePattern, stop)
  }

  _onSelectStop = (key: number) =>
    this.props.addStopToPattern(this.props.activePattern, this.props.stop, key)

  render () {
    const {
      activePattern,
      stop
    } = this.props
    const color = 'blue'
    const stopName = `${stop.stop_name} (${stop.stop_code ? stop.stop_code : stop.stop_id})`
    const transparentBusIcon = divIcon({
      html: `<span title="${stopName}" class="fa-stack" style="opacity: 0.3">
              <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
              <i class="fa fa-bus fa-stack-1x" style="color: ${color}"></i>
            </span>`,
      className: '',
      iconSize: [24, 24]
    })
    // TODO: Refactor to share code with PatternStopButtons
    return (
      <Marker
        position={[stop.stop_lat, stop.stop_lon]}
        icon={transparentBusIcon}>
        <Popup>
          <div style={{minWidth: '180px'}}>
            <h5>{stopName}</h5>
            <Dropdown
              id={`add-stop-dropdown`}
              pullRight
              onSelect={this._onSelectStop}>
              <Button
                bsStyle='success'
                onClick={this._onClickAddStopToEnd}>
                <Icon type='plus' /> Add stop
              </Button>
              <Dropdown.Toggle
                bsStyle='success' />
              <Dropdown.Menu style={{maxHeight: '200px', overflowY: 'scroll'}}>
                <MenuItem
                  value={activePattern.patternStops.length}
                  eventKey={activePattern.patternStops.length}>
                  Add to end (default)
                </MenuItem>
                {activePattern.patternStops && activePattern.patternStops.map((stop, i) => {
                  const index = activePattern.patternStops.length - i
                  return (
                    <MenuItem
                      value={index - 1}
                      eventKey={index - 1}
                      key={i}>
                      {index === 1 ? 'Add to beginning' : `Insert as stop #${index}`}
                    </MenuItem>
                  )
                })}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Popup>
      </Marker>
    )
  }
}
