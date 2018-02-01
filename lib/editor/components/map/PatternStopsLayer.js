import clone from 'lodash.clonedeep'
import React, {Component, PropTypes} from 'react'
import {FeatureGroup} from 'react-leaflet'

import {POINT_TYPE} from '../../constants'
import PatternStopMarker from './PatternStopMarker'

export default class PatternStopsLayer extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    addStopToPattern: PropTypes.func,
    editSettings: PropTypes.object,
    removeStopFromPattern: PropTypes.func,
    patternEdited: PropTypes.bool.isRequired,
    stops: PropTypes.array
  }
  render () {
    const {
      activePattern,
      addStopToPattern,
      controlPoints,
      editSettings,
      patternStop: activePatternStop,
      patternSegment,
      removeStopFromPattern,
      setActiveStop,
      stops
    } = this.props
    if (!stops || !activePattern || !editSettings.showStops || !activePattern.patternStops) {
      return null
    }
    const activeStopNotFound = activePattern &&
      activePatternStop &&
      activePattern.patternStops &&
      activePattern.patternStops.findIndex(ps => ps.id === activePatternStop.id) === -1
    let cpIndex = 0
    let psIndex = 0
    const patternStopsWithControlPointIndexes = clone(activePattern.patternStops)
    while (controlPoints[cpIndex]) {
      if (controlPoints[cpIndex].pointType === POINT_TYPE.STOP) {
        patternStopsWithControlPointIndexes[psIndex].cpIndex = cpIndex
        psIndex++
      }
      cpIndex++
    }
    return (
      <FeatureGroup id='PatternStops'>
        {patternStopsWithControlPointIndexes.map((patternStop, index) => {
          const {cpIndex, stopId} = patternStop
          const stop = stops.find(s => s.stop_id === stopId)
          if (!stop) {
            console.warn(`Could not find stop for stopId: ${stopId}`, stops)
            return
          }
          // Do not render pattern stop if hiding inactive segments and
          // pattern stop does not reference one of the adjacent control points.
          if (editSettings.hideInactiveSegments && (cpIndex > patternSegment + 1 || cpIndex < patternSegment - 1)) {
            return null
          }
          return (
            <PatternStopMarker
              {...this.props}
              index={index}
              ref={patternStop.id}
              key={patternStop.id}
              addStopToPattern={addStopToPattern}
              setActiveStop={setActiveStop}
              active={activePatternStop.id === patternStop.id || (activeStopNotFound && activePatternStop.index === index)} // fallback to index if/when id changes
              removeStopFromPattern={removeStopFromPattern}
              stop={stop}
              patternStop={patternStop} />
          )
        })}
      </FeatureGroup>
    )
  }
}
