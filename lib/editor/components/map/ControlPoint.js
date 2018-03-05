import throttle from 'lodash.throttle'
// import point from 'turf-point'
import React, {Component, PropTypes} from 'react'
import {Marker, Tooltip} from 'react-leaflet'
import {shallowEqual} from 'react-pure-render'

export default class ControlPoint extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    controlPoint: PropTypes.object,
    controlPoints: PropTypes.array,
    editSettings: PropTypes.object,
    icon: PropTypes.object,
    index: PropTypes.number,
    handleControlPointDrag: PropTypes.func,
    handleControlPointDragEnd: PropTypes.func,
    handleControlPointDragStart: PropTypes.func,
    permanent: PropTypes.bool,
    position: PropTypes.array,
    removeControlPoint: PropTypes.func,
    updateActiveEntity: PropTypes.func
  }

  state = {
    latlng: null
  }

  shouldComponentUpdate (nextProps) {
    // FIXME: fix this hack that keeps unknown position change (perhaps
    // react-leaflet is updating it) from triggering a component update, which
    // funks with the position of the marker.
    return !shallowEqual(nextProps.controlPoint.snap, this.props.controlPoint.snap) ||
      !shallowEqual(nextProps.editSettings.showTooltips, this.props.editSettings.showTooltips) ||
      !shallowEqual(nextProps.patternSegment, this.props.patternSegment) ||
      !shallowEqual(nextProps.isActive, this.props.isActive)
  }

  _onClick = (e) => {
    const {
      controlPoints,
      removeControlPoint,
      setActivePatternSegment,
      activePattern,
      patternCoordinates,
      stopId,
      index,
      isActive
    } = this.props
    // only remove controlPoint if it's not based on pattern stop
    if (isActive && !stopId) {
      removeControlPoint(controlPoints, index, activePattern, patternCoordinates)
    } else {
      setActivePatternSegment(index)
    }
  }

  /**
   * Handle dragging via a throttled function
   *
   * FIXME: Make distinction between dragging a stop (always snap to line?) and
   * dragging a standard control point.
   * @param  {Event} e http://leafletjs.com/reference-1.1.0.html#event
   */
  _onDrag = throttle(e => {
    const {
      activePattern,
      controlPoints,
      handleControlPointDrag,
      index,
      patternCoordinates
    } = this.props
    const latlng = e.latlng
    this.setState({latlng})
    // console.log(`drag to`, `http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(point([latlng.lng, latlng.lat])))}`)
    handleControlPointDrag(controlPoints, index, latlng, activePattern, patternCoordinates)
  }, 500, {leading: false})

  /**
   * Handle a drag end event
   *
   * @param  {DragEndEvent} e http://leafletjs.com/reference-1.1.0.html#dragendevent
   */
  _onDragEnd = (e) => {
    const {activePattern, controlPoints, handleControlPointDragEnd, index, patternCoordinates} = this.props
    this.setState({latlng: null, drag: null})
    handleControlPointDragEnd(controlPoints, index, e.target.getLatLng(), activePattern, patternCoordinates)
  }

  /**
   * Register the initiation of the drag event for this control point.
   */
  _onDragStart = () => {
    const {controlPoint, handleControlPointDragStart} = this.props
    handleControlPointDragStart(controlPoint)
  }

  render () {
    // console.log(this.state)
    const {controlPoint, editSettings, icon, position, isActive} = this.props
    // keep track of position in state because we need this to be cleared once
    // the user has stopped dragging the marker, at which point
    // this.state.latlng will be null and the marker will "snap" back to the
    // polyline
    const {latlng} = this.state
    const tooltipMessage = isActive && controlPoint.stopId
      ? 'Drag handle to change stop snap point'
      : isActive
      ? 'Drag handle to change shape (click to remove)'
      : 'Click to begin editing segment'
    const markerPosition = latlng
      ? [latlng.lat, latlng.lng]
      : position
    const dragProps = isActive
    ? {
      draggable: true,
      onDrag: this._onDrag,
      onDragStart: this._onDragStart,
      onDragEnd: this._onDragEnd
    }
    : {}
    return (
      <Marker
        position={markerPosition}
        icon={icon}
        ref='marker'
        zIndexOffset={1000}
        {...dragProps}
        onClick={this._onClick} >
        {/* TODO: need to fix onDrag so that components updates and hides tooltip while dragging */}
        {!latlng && tooltipMessage &&
          <Tooltip
            key={Math.random()}
            opacity={editSettings.showTooltips ? 0.9 : 0}>
            <span>{tooltipMessage}</span>
          </Tooltip>
        }
      </Marker>
    )
  }
}
