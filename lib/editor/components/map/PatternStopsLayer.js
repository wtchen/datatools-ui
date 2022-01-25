// @flow

import clone from 'lodash/cloneDeep'
import React, {Component} from 'react'

import * as activeActions from '../../actions/active'
import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import * as tripPatternActions from '../../actions/tripPattern'
import {POINT_TYPE} from '../../constants'
import type {ControlPoint, Feed, GtfsLocation, GtfsStop, Pattern, PatternStop} from '../../../types'
import type {EditSettingsState} from '../../../types/reducers'

import PatternStopMarker from './PatternStopMarker'
import PatternLocationMarker from './PatternLocationMarker'

type Props = {
  activePattern: Pattern,
  activePatternLocations: Array<GtfsLocation>,
  activePatternStops: Array<GtfsStop>,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  controlPoints: Array<ControlPoint>,
  editSettings: EditSettingsState,
  feedSource: Feed,
  patternEdited: boolean,
  patternSegment: number,
  patternStop: {id: any, index: number},
  removeStopFromPattern: typeof stopStrategiesActions.removeStopFromPattern,
  saveActiveGtfsEntity: typeof activeActions.saveActiveGtfsEntity,
  setActiveEntity: typeof activeActions.setActiveEntity,
  setActiveStop: typeof tripPatternActions.setActiveStop,
  updatePatternStops: typeof tripPatternActions.updatePatternStops
}

export default class PatternStopsLayer extends Component<Props> {
  render () {
    const {
      activePattern,
      activePatternLocations,
      activePatternStops,
      addStopToPattern,
      controlPoints,
      editSettings,
      patternSegment,
      removeStopFromPattern,
      setActiveStop
    } = this.props
    // FIXME: There is an issue here where the patternStop prop refers to the active
    // pattern stop, but in PatternStopMarker begins to refer to the PatternStop
    // type. The below destructuring is to satisfy Flow.
    const {patternStop: activePatternStop, ...otherProps} = this.props
    if (!activePatternStops || !activePattern || !editSettings.showStops) {
      return null
    }
    const {patternLocations, patternStops} = activePattern

    const activeStopNotFound = activePatternStop &&
      patternStops.findIndex(ps => ps.id === activePatternStop.id) === -1 &&
      patternLocations.findIndex(pl => pl.id === activePatternStop.id) === -1
    let cpIndex = 0
    let psIndex = 0
    const patternStopsWithControlPointIndexes = []
    // Associate pattern stops with control point indices.
    while (controlPoints[cpIndex]) {
      if (controlPoints[cpIndex].pointType === POINT_TYPE.STOP) {
        const clonedPatternStop: PatternStop = clone(patternStops[psIndex])
        if (!clonedPatternStop) {
          console.warn(`No pattern stop for control point index ${cpIndex}.`)
          break
        }
        patternStopsWithControlPointIndexes.push({...clonedPatternStop, cpIndex})
        psIndex++
      }
      cpIndex++
    }
    if (cpIndex < patternStops.length) {
      console.warn(`Fewer control points (${controlPoints.length}) than pattern stops (${patternStops.length})!`, controlPoints, patternStops)
    }
    return (
      <div id='PatternStops'>
        {patternStopsWithControlPointIndexes.map((patternStop, index) => {
          const {cpIndex, stopId} = patternStop
          const stop = activePatternStops.find(s => s.stop_id === stopId)
          if (!stop) {
            console.log(stop)
            console.warn(`Could not find stop for stopId: ${stopId}`, activePatternStops)
            return
          }
          if (
            editSettings.hideInactiveSegments &&
            (cpIndex > patternSegment + 1 || cpIndex < patternSegment - 1)
          ) {
            // Do not render pattern stop if hiding inactive segments and
            // pattern stop does not reference one of the adjacent control points.
            return null
          }
          return (
            <PatternStopMarker
              {...otherProps}
              index={index}
              ref={`${patternStop.id}`}
              key={patternStop.id}
              addStopToPattern={addStopToPattern}
              setActiveStop={setActiveStop}
              // fallback to index if/when id changes
              active={activePatternStop.id === patternStop.id ||
                (activeStopNotFound && activePatternStop.index === index)
              }
              removeStopFromPattern={removeStopFromPattern}
              stop={stop}
              patternStop={patternStop} />
          )
        })}
        {patternLocations.map((patternLocation, index) => {
          const location = activePatternLocations.find(l => l.location_id === patternLocation.locationId)
          return <PatternLocationMarker
            {...otherProps}
            index={index}
            ref={`${patternLocation.id || patternLocation.locationId}`}
            key={patternLocation.id}
            addStopToPattern={addStopToPattern}
            setActiveStop={setActiveStop}
            // fallback to index if/when id changes
            active={activePatternStop.id === patternLocation.id ||
              (activeStopNotFound && activePatternStop.index === index)
            }
            removeStopFromPattern={removeStopFromPattern}
            location={location}
            patternLocation={patternLocation} />
        })}
      </div>
    )
  }
}
