import React, { Component, PropTypes } from 'react'
import { MenuItem, SplitButton } from 'react-bootstrap'
import { divIcon } from 'leaflet'
import {Icon} from '@conveyal/woonerf'
import { Marker, Popup, FeatureGroup } from 'react-leaflet'

export default class AddableStopsLayer extends Component {
  static propTypes = {
    stops: PropTypes.array
  }
  render () {
    const {
      stops,
      activePattern,
      editSettings,
      mapState
    } = this.props
    const { bounds } = mapState
    return (
      <FeatureGroup
        ref='addableStops'
        key='addableStops'
      >
        {stops && activePattern && editSettings.addStops && mapState.zoom > 14
          ? stops
            .filter(stop => {
              if (!bounds) return false
              if (stop.stop_lat > bounds.getNorth() || stop.stop_lat < bounds.getSouth() || stop.stop_lon > bounds.getEast() || stop.stop_lon < bounds.getWest()) {
                return false
              } else {
                return true
              }
            })
            .map((stop, index) => {
              if (!stop) return null
              let patternStop = activePattern.patternStops.find(ps => ps.stopId === stop.id)
              if (patternStop) return null
              const color = 'blue'
              const busIcon = divIcon({
                html: `<span class="fa-stack" style="opacity: 0.3">
                        <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
                        <i class="fa fa-bus fa-stack-1x" style="color: ${color}"></i>
                      </span>`,
                className: '',
                iconSize: [24, 24]
              })
              return (
                <Marker
                  position={[stop.stop_lat, stop.stop_lon]}
                  style={{cursor: 'move'}}
                  icon={busIcon}
                  ref={`${stop.id}-${index}`}
                  key={`${stop.id}-${index}`}
                >
                  <Popup>
                    <div>
                      <h5>{stop.stop_name}</h5>
                      <SplitButton
                        title={<span><Icon type='plus' /> Add stop</span>}
                        id={`add-stop-dropdown`}
                        bsStyle='success'
                        onSelect={(key) => {
                          this.addStopToPattern(activePattern, stop, key)
                        }}
                        onClick={(e) => {
                          this.addStopToPattern(activePattern, stop)
                        }}
                      >
                        <MenuItem value={activePattern.patternStops.length} eventKey={activePattern.patternStops.length}>
                          Add to end (default)
                        </MenuItem>
                        {activePattern.patternStops && activePattern.patternStops.map((stop, i) => {
                          let index = activePattern.patternStops.length - i
                          return (
                            <MenuItem value={index - 1} eventKey={index - 1} key={i}>
                              {index === 1 ? 'Add to beginning' : `Insert as stop #${index}`}
                            </MenuItem>
                          )
                        })}
                      </SplitButton>
                    </div>
                  </Popup>
                </Marker>
              )
            })
          : null
        }
      </FeatureGroup>
    )
  }
}
