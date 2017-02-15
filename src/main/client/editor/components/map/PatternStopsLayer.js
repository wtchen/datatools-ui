import React, { Component, PropTypes } from 'react'
import { divIcon } from 'leaflet'
import { Marker, Popup, FeatureGroup } from 'react-leaflet'

import PatternStopPopup from './PatternStopPopup'

export default class PatternStopsLayer extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    addStopToPattern: PropTypes.func,
    editSettings: PropTypes.object,
    removeStopFromPattern: PropTypes.func,
    stops: PropTypes.array
  }
  render () {
    const {
      activePattern,
      addStopToPattern,
      editSettings,
      removeStopFromPattern,
      stops
    } = this.props
    return (
      <FeatureGroup
        ref='patternStops'
        key='patternStops'
      >
        {stops && activePattern && !editSettings.hideStops
          ? activePattern.patternStops && activePattern.patternStops.map((s, index) => {
            const stop = stops.find(ps => ps.id === s.stopId)
            if (!stop) return null
            const patternStopIcon = divIcon({
              html: `<span title="${index + 1}. ${stop.stop_name}" class="fa-stack">
                      <i class="fa fa-circle fa-stack-2x"></i>
                      <strong class="fa-stack-1x fa-inverse calendar-text">${index + 1}</strong>
                    </span>`,
              className: '',
              iconSize: [24, 24]
            })
            return (
              <Marker
                position={[stop.stop_lat, stop.stop_lon]}
                style={{cursor: 'move'}}
                icon={patternStopIcon}
                ref={`${activePattern.id}-${s.stopId}-${index}`}
                key={`${activePattern.id}-${s.stopId}-${index}`}
              >
                <Popup>
                  <PatternStopPopup
                    {...this.props}
                    index={index}
                    addStopToPattern={addStopToPattern}
                    removeStopFromPattern={removeStopFromPattern}
                    stop={stop}
                    patternStop={s}
                  />
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
