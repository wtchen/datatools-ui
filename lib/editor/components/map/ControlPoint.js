import throttle from 'lodash.throttle'
import React, { Component, PropTypes } from 'react'
import { Marker } from 'react-leaflet'
import { shallowEqual } from 'react-pure-render'

export default class ControlPoint extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    controlPoint: PropTypes.object,
    icon: PropTypes.object,
    index: PropTypes.number,
    handleControlPointDrag: PropTypes.func,
    handleControlPointDragEnd: PropTypes.func,
    next: PropTypes.object,
    permanent: PropTypes.bool,
    position: PropTypes.array,
    previous: PropTypes.object,
    removeControlPoint: PropTypes.func,
    updateActiveEntity: PropTypes.func,
    updateControlPoint: PropTypes.func,
    updatePatternCoordinates: PropTypes.func
  }

  state = {
    latlng: null
  }

  shouldComponentUpdate (nextProps) {
    // TODO: fix this hack that keeps unknown position change (perhaps react-leaflet is updating it) from triggering
    // a component update, which funks with the position of the marker
    return !shallowEqual(nextProps.controlPoint.snap, this.props.controlPoint.snap)
  }

  _onClick = (e) => {
    const {permanent, removeControlPoint, activePattern, index, previous, next} = this.props
    // only remove controlPoint if it's not based on pattern stop (i.e., has permanent prop)
    if (!permanent) {
      removeControlPoint(activePattern, index, previous, next)
    }
  }

  handleDrag = () => {
    const {activePattern, handleControlPointDrag, next, previous} = this.props
    const latlng = this.refs.marker.leafletElement.getLatLng()
    this.setState({latlng})
    handleControlPointDrag(latlng, previous, next, activePattern)
  }

  _onDragEnd = (e) => {
    const {activePattern, controlPoint, handleControlPointDragEnd, index} = this.props
    this.setState({latlng: null})
    handleControlPointDragEnd(index, controlPoint, e, activePattern)
  }

  render () {
    if (this.props.index === 1) console.log(this.props)
    const {position, icon} = this.props

    // keep track of position in state because we need this to be cleared once the user has
    // stopped dragging the marker, at which point this.state.latlng will be null and the marker
    // will "snap" back to the polyline
    const {latlng} = this.state
    const markerPosition = latlng
      ? [latlng.lat, latlng.lng]
      : position
    return (
      <Marker
        position={markerPosition}
        icon={icon}
        ref='marker'
        zIndexOffset={1000}
        draggable
        onDrag={throttle(this.handleDrag, 500)}
        onDragEnd={this._onDragEnd}
        onClick={this._onClick}
        color='black' />
    )
  }
}
