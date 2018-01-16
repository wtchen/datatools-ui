import React, { Component, PropTypes } from 'react'
import { divIcon } from 'leaflet'
import { FeatureGroup } from 'react-leaflet'

import ControlPoint from './ControlPoint'
import {isValidPoint} from '../../util/map'

export default class ControlPointsLayer extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    controlPoints: PropTypes.array,
    editSettings: PropTypes.object,
    removeControlPoint: PropTypes.func,
    setActivePatternSegment: PropTypes.func,
    stops: PropTypes.array,
    updateActiveEntity: PropTypes.func
  }

  render () {
    const {
      stops,
      activePattern,
      controlPoints,
      editSettings,
      patternCoordinates,
      patternSegment,
      setActivePatternSegment
    } = this.props
    const isEditing = stops && activePattern && patternCoordinates && editSettings.editGeometry && controlPoints
    return (
      <FeatureGroup ref='controlPoints'>
        {isEditing
          ? controlPoints.map((cp, index) => {
            // don't include controlPoint on end of segment (for now) or hidden controlPoints
            if (cp.stopId && editSettings.snapToStops) {
              return null
            }
            if (editSettings.hideInactiveSegments && (index > patternSegment + 1 || index < patternSegment - 1)) {
              // Do not render inactive control points if hide is enabled and
              // not adjacent to segment
              return null
            }
            const {point} = cp
            const isActive = index === patternSegment
            const color = isActive
              ? '#000'
              : index === patternSegment - 1 // control point before
              ? 'blue'
              : index === patternSegment + 1 // control point after
              ? 'yellow'
              : '#888' // inactive
            const iconType = cp.stopId ? 'fa-square' : 'fa-times'
            if (!isValidPoint(point)) {
              return null
            }
            const {coordinates} = point.geometry
            const icon = divIcon({
              className: '',
              html: `<i class="fa ${iconType}" style="color: ${color}"/>`
            })
            return (
              <ControlPoint
                position={[coordinates[1], coordinates[0]]}
                icon={icon}
                controlPoint={cp}
                key={cp.id}
                stopId={cp.stopId}
                index={index}
                isActive={isActive}
                patternSegment={patternSegment}
                permanent={cp.permanent}
                setActivePatternSegment={setActivePatternSegment}
                {...this.props} />
            )
          })
          : null
        }
      </FeatureGroup>
    )
  }
}
