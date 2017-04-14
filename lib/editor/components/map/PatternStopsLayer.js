import React, {Component, PropTypes} from 'react'
import {FeatureGroup} from 'react-leaflet'

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
        {stops && activePattern && editSettings.showStops
          ? activePattern.patternStops && activePattern.patternStops.map((s, index) => {
            const stop = stops.find(ps => ps.id === s.stopId)
            if (!stop) return null
            return (
              <PatternStopPopup
                {...this.props}
                index={index}
                ref={`${activePattern.id}-${s.stopId}-${index}`}
                key={`${activePattern.id}-${s.stopId}-${index}`}
                addStopToPattern={addStopToPattern}
                removeStopFromPattern={removeStopFromPattern}
                stop={stop}
                patternStop={s}
              />
            )
          })
          : null
        }
      </FeatureGroup>
    )
  }
}
