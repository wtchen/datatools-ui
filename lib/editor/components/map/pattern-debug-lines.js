import React, {PropTypes, Component} from 'react'
import {FeatureGroup, Polyline} from 'react-leaflet'
import lineDistance from 'turf-line-distance'
import lineString from 'turf-linestring'

import {POINT_TYPE} from '../../constants'
import {isValidPoint} from '../../util/map'

/**
 * This react-leaflet component draws connecting lines between a pattern
 * geometry's anchor points (that are associated with stops) and their
 * corresponding stops. This is mainly intended as a debugging feature, but may
 * be useful during the normal course of editing.
 *
 * Perhaps a useful way to think about what this line represents is to consider
 * the path someone waiting at a bus stop would need to walk to board a bus. If
 * the passenger doesn't actually need to walk that path, the pattern shape (or
 * at least the connection point that has been generated) is likely wrong.
 */

const DISTANCE_THRESHOLD = 50

export default class PatternDebugLines extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    controlPoints: PropTypes.array,
    stops: PropTypes.array
  }
  render () {
    const {activePattern, controlPoints, editSettings, patternSegment, patternStop, stops} = this.props
    if (!activePattern || !controlPoints || !stops) return null
    return (
      <FeatureGroup id='pattern-debug-lines'>
        {controlPoints
          // Add control point indexes to determine if activesegment is adjacent
          // i.e., whether the line should be rendered.
          .map((cp, index) => ({...cp, cpIndex: index}))
          // Filter out the user-added anchors
          .filter(cp => cp.pointType === POINT_TYPE.STOP)
          // The remaining number should match the number of stops
          .map((cp, index) => {
            const {cpIndex, point, stopId} = cp
            if (!isValidPoint(point)) {
              return null
            }
            if (editSettings.hideInactiveSegments && (cpIndex > patternSegment + 1 || cpIndex < patternSegment - 1)) {
              return null
            }
            const patternStopIsActive = patternStop.index === index
            // Do not render if some other pattern stop is active
            if ((patternStop.index || patternStop.index === 0) && !patternStopIsActive) {
              return null
            }
            const {coordinates: cpCoord} = point.geometry
            const stop = stops.find(s => s.stop_id === stopId)
            if (!stop) {
              console.warn(`Could not find stop for pattern stop index=${index}`)
              return null
            }
            const coordinates = [[cpCoord[1], cpCoord[0]], [stop.stop_lat, stop.stop_lon]]
            const distance = lineDistance(lineString(coordinates), 'meters')
            const distanceGreaterThanThreshold = distance > DISTANCE_THRESHOLD
            if (distanceGreaterThanThreshold) {
              console.warn(`Distance from pattern stop index=${index} to projected point is greater than ${DISTANCE_THRESHOLD} (${distance}).`)
            }
            return (
              <Polyline
                key={index}
                // React leaflet coordinates are [lat, lon]
                positions={coordinates}
                dashArray='5, 5'
                lineCap='butt'
                color={distanceGreaterThanThreshold
                    ? 'red'
                    : patternStopIsActive ? 'blue' : 'black'}
                weight={2}
                opacity={0.6} />
            )
          })
        }
      </FeatureGroup>
    )
  }
}
