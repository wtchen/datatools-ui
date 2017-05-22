import React, {Component, PropTypes} from 'react'
import {FeatureGroup} from 'react-leaflet'

import PatternStopMarker from './PatternStopMarker'

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
      patternStopId,
      removeStopFromPattern,
      setActiveStop,
      stops
    } = this.props
    return (
      <FeatureGroup id='PatternStops'>
        {stops && activePattern && editSettings.showStops
          ? activePattern.patternStops && activePattern.patternStops.map((patternStop, index) => {
            const stop = stops.find(ps => ps.id === patternStop.stopId)
            if (!stop) return null
            return (
              <PatternStopMarker
                {...this.props}
                index={index}
                ref={patternStop.id}
                key={patternStop.id}
                addStopToPattern={addStopToPattern}
                setActiveStop={setActiveStop}
                active={patternStopId === patternStop.id}
                removeStopFromPattern={removeStopFromPattern}
                stop={stop}
                patternStop={patternStop} />
            )
          })
          : null
        }
      </FeatureGroup>
    )
  }
}
