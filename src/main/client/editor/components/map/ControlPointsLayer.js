import React, { Component, PropTypes } from 'react'
import { divIcon } from 'leaflet'
import { Marker, FeatureGroup } from 'react-leaflet'
import point from 'turf-point'
import along from 'turf-along'

export default class ControlPointsLayer extends Component {
  static propTypes = {
    stops: PropTypes.array
  }
  render () {
    const {
      stops,
      activePattern,
      editSettings,
      handlePatternEdit,
      polyline,
      handleControlPointDragEnd,
      onDrag,
      removeControlPoint,
      controlPoints
    } = this.props
    let timer = null
    const circleIcon = divIcon({
      className: '',
      html: `<i class="fa fa-times"/>`
    })
    const beginPoint = activePattern && activePattern.shape ? [activePattern.shape.coordinates[0][1], activePattern.shape.coordinates[0][0]] : null
    return (
      <FeatureGroup ref='controlPoints' key='controlPoints'>
        {stops && stops.length && activePattern && activePattern.shape && editSettings.editGeometry && controlPoints
        ? controlPoints.map((cp, index) => {
          // don't include controlPoint on end of segment (for now) or hidden controlPoints
          console.log(cp)
          if (cp.stopId && editSettings.snapToStops) {
            return null
          }
          let prevControlPoint = controlPoints[index - 1]
          let nextControlPoint = controlPoints[index + 1]

          let begin = prevControlPoint
                    ? prevControlPoint.point
                    : along(activePattern.shape, 0, 'meters')
          let end
          if (nextControlPoint) {
            end = nextControlPoint.point
          }
          let position = cp.point
          const color = cp.permanent ? '#000' : '#888'
          const iconType = cp.stopId ? 'fa-square' : 'fa-times'
          if (!position || !position.geometry || !position.geometry.coordinates) {
            return null
          }
          const timesIcon = divIcon({
            className: '',
            // iconSize: [24, 24],
            html: `<i class="fa ${iconType}" style="color: ${color}"/>`
          })
          const pos = [position.geometry.coordinates[1], position.geometry.coordinates[0]]
          console.log(pos)
          return (
            <Marker
              position={pos}
              icon={timesIcon}
              zIndexOffset={1000}
              // key={Math.random()}
              ref={`controlPoint-${index}`}
              key={`controlPoint-${index}`}
              draggable
              onDragStart={(e) => {
                const timerFunction = () => {
                  handlePatternEdit(`controlPoint-${index}`, begin, end, polyline, activePattern)
                }
                timerFunction()
                timer = setInterval(timerFunction, 500)
              }}
              onDragEnd={(e) => {
                handleControlPointDragEnd(e, timer, `controlPoint-${index}`, index)
              }}
              onClick={(e) => {
                console.log('control point clicked', e)
                // only remove controlPoint if it's not based on pattern stop (i.e., has permanent prop)
                if (!cp.permanent) {
                  removeControlPoint(activePattern, index, begin, end, polyline)
                }
              }}
              color='black'
            />
          )
        })
        : null
        }
        {beginPoint && editSettings.editGeometry && activePattern
        ? <Marker
          position={beginPoint}
          icon={circleIcon}
          ref={Marker => { this.controlPoint = Marker }}
          draggable
          onDragStart={(e) => {
            let beginStop = stops.find(s => s.id === activePattern.patternStops[0].stopId)
            let begin = point([beginStop.stop_lon, beginStop.stop_lat])
            const timerFunction = () => {
              const coords = handlePatternEdit('controlPointBegin', null, begin, polyline, activePattern)
              onDrag(coords)
            }
            timerFunction()
            timer = setInterval(timerFunction, 1000)
          }}
          onDragEnd={(e) => {
            const coords = handleControlPointDragEnd(e, timer, this.controlPoint, null, polyline, activePattern)
            onDrag(coords)
          }}
          color='black'
        />
        : null
        }
      </FeatureGroup>
    )
  }
}
