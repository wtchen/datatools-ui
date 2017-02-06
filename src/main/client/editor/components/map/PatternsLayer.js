import React, { Component, PropTypes } from 'react'
import { FeatureGroup, Polyline } from 'react-leaflet'

export default class PatternsLayer extends Component {
  static propTypes = {
    route: PropTypes.object
  }
  _onClick (pattern, isActive, controlPoints, e) {
    return isActive && this.props.constructControlPoint(pattern, e.latlng, controlPoints)
    // TODO: make clicked pattern active if non-active?
  }
  render () {
    const {
      route,
      subEntityId,
      activePattern,
      activeEntity,
      editSettings,
      controlPoints,
      patternCoordinates
    } = this.props
    console.log(this.props)
    return (
      <FeatureGroup ref='patterns' key='patterns'>
        {route && route.tripPatterns
          ? route.tripPatterns
            .map(tp => {
              const isActive = subEntityId === tp.id
              let pattern = isActive ? activePattern : tp
              const latLngs = pattern && pattern.shape ? pattern.shape.coordinates.map(c => ([c[1], c[0]])) : []

              // NOTE: don't render pattern if latlngs don't exist or a single pattern is active
              if (!latLngs || !isActive && subEntityId) {
                return null
              }
              let lineColor = activeEntity.route_color && editSettings.editGeometry
                ? '#F3F315' // yellow if editing
                : activeEntity.route_color // otherwise, use route color if it exists
                ? `#${activeEntity.route_color}`
                : editSettings.editGeometry
                ? '#F3F315' // yellow if editing
                : 'blue'
              return (
                <Polyline
                  positions={patternCoordinates && patternCoordinates.map(c => ([c[1], c[0]])) || latLngs}
                  key={tp.id}
                  onClick={e => this._onClick(pattern, isActive, controlPoints, e)}
                  lineCap='butt'
                  color={lineColor}
                  opacity={isActive ? 0.8 : 0.5}
                />
              )
            })
          : null
        }
      </FeatureGroup>
    )
  }
}
