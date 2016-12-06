import React, { Component, PropTypes } from 'react'
import bearing from 'turf-bearing'
import { divIcon } from 'leaflet'
import { Marker, FeatureGroup } from 'react-leaflet'
import lineDistance from 'turf-line-distance'
import along from 'turf-along'

export default class DirectionIconsLayer extends Component {
  static propTypes = {
    activePattern: PropTypes.object
  }
  render () {
    const { activePattern, mapState } = this.props
    const { zoom, bounds } = mapState
    // let zoom = this.refs.map ? this.refs.map.leafletElement.getZoom() : 11
    // let bounds = this.refs.map && this.refs.map.leafletElement.getBounds()
    // get intervals along path for arrow icons
    let patternLength = activePattern && activePattern.shape ? lineDistance(activePattern.shape, 'meters') : 0
    let iconInterval = zoom > 15
      ? 200
      : zoom > 14
      ? 500
      : zoom > 12
      ? 2000
      : zoom > 10
      ? 4000
      : zoom > 6
      ? 8000
      : 10000
    let lengthsAlongPattern = []
    for (var i = 0; i < Math.floor(patternLength / iconInterval); i++) {
      let distance = i ? iconInterval * i : iconInterval / 2
      let position = along(activePattern.shape, distance, 'meters')
      if (!bounds) continue
      if (position.geometry.coordinates[1] > bounds.getNorth() || position.geometry.coordinates[1] < bounds.getSouth() || position.geometry.coordinates[0] > bounds.getEast() || position.geometry.coordinates[0] < bounds.getWest()) {
        continue
      }
      lengthsAlongPattern.push([distance, position])
    }
    return (
      <FeatureGroup>
        {lengthsAlongPattern.length && activePattern // this.refs[activePattern.id]
          ? lengthsAlongPattern.map((length, index) => {
            let distance = length[0]
            let position = length[1]

            let nextPosition = along(activePattern.shape, distance + 5, 'meters')
            const dir = position && nextPosition ? bearing(position, nextPosition) : 0
            const color = '#000'
            const arrowIcon = divIcon({
              html: `<i class="fa fa-arrow-up" style="color: ${color}; transform: rotate(${dir}deg)"></i>`,
              className: ''
            })
            if (!position || !position.geometry || !position.geometry.coordinates) {
              return null
            }
            return (
              <Marker
                position={[position.geometry.coordinates[1], position.geometry.coordinates[0]]}
                icon={arrowIcon}
                key={`directionIcon-${index}`}
                color='black' />
            )
          })
          : null
        }
      </FeatureGroup>
    )
  }
}
