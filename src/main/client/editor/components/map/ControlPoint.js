import React, { Component, PropTypes } from 'react'
import { Marker } from 'react-leaflet'

import { handlePatternEdit, handleControlPointDragEnd } from '../../util/map'

export default class ControlPoint extends Component {
  static propTypes = {
    position: PropTypes.array
  }
  constructor (props) {
    super(props)
    this.state = {
      timer: null,
      latlng: null
    }
  }
  render () {
    const { position, icon, previous, next, activePattern, index, permanent, removeControlPoint, updateActiveEntity, updateControlPoint, editSettings } = this.props
    const { patternCoordinates, followStreets } = editSettings
    return (
      <Marker
        position={this.state.latlng || position}
        icon={icon}
        ref='marker'
        zIndexOffset={1000}
        draggable
        onDragStart={(e) => {
          const timerFunction = () => {
            const latlng = this.refs.marker.leafletElement.getLatLng()
            // console.log(latlng)
            handlePatternEdit(latlng, this.props.previous, this.props.next, this.props.activePattern, followStreets, patternCoordinates)
            .then(coords => {
              this.setState({latlng})
              this.props.updatePatternCoordinates(coords)
            })
          }
          timerFunction()
          let timer = setInterval(timerFunction, 500)
          this.setState({timer})
        }}
        onDragEnd={(e) => {
          // console.log('drag end')
          // clear timer
          if (this.state.timer) clearInterval(this.state.timer)
          const { snap, distTraveled } = handleControlPointDragEnd(e, patternCoordinates)
          updateActiveEntity(activePattern, 'trippattern', {shape: {type: 'LineString', coordinates: patternCoordinates}})
          updateControlPoint(index, snap, distTraveled)
          this.setState({latlng: null})
        }}
        onClick={(e) => {
          console.log('control point clicked', e)
          // only remove controlPoint if it's not based on pattern stop (i.e., has permanent prop)
          if (!permanent) {
            removeControlPoint(activePattern, index, previous, next)
          }
        }}
        color='black'
      />
    )
  }
}
