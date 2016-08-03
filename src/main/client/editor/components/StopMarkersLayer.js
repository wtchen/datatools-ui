import React, { PropTypes } from 'react'
import { latLng } from 'leaflet'
import {FeatureGroup, Marker} from 'react-leaflet'

export default class StopMarkersLayer extends FeatureGroup {

  static propTypes = {
    stops: PropTypes.array,
    activeEntity: PropTypes.object,
    feedSource: PropTypes.object,
    mapState: PropTypes.object,
    setActiveEntity: PropTypes.func,
    updateActiveEntity: PropTypes.func,
    entityEdited: PropTypes.bool
  }
  constructor (props) {
    super(props)
  }
  render () {
    let { stops, activeEntity, feedSource, mapState, setActiveEntity, updateActiveEntity, entityEdited } = this.props
    return (
      <FeatureGroup>
        {stops
          ? stops.map(stop => {
              const isActive = activeEntity && activeEntity.id === stop.id
              if (isActive) return null
              if (!isActive) {
                if (!mapState.zoom || mapState.zoom < 14) {
                  return null
                }
                if (stop.stop_lat > mapState.bounds.getNorth() || stop.stop_lat < mapState.bounds.getSouth() || stop.stop_lon > mapState.bounds.getEast() || stop.stop_lon < mapState.bounds.getWest()) {
                  return null
                }
              }
              if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon)) {
                return null
              }
              const stopLatLng = [stop.stop_lat, stop.stop_lon]
              const escapeListener = (e) => {
                console.log(e)
                // [Esc] is pressed
                if (e.keyCode === 27 && entityEdited) {
                  console.log('escape pressed')
                  this.setState({editStop: null, editFinished: null, editStopLatLng: null})

                  // reset latlng
                  this.refs[stop.id].leafletElement.setLatLng(stopLatLng)

                  // set active entity
                  setActiveEntity(feedSource.id, 'stop', stop)

                  // remove listeners
                  this.refs.map.leafletElement.removeEventListener('mousemove')
                  document.removeEventListener('keydown', escapeListener, false)
                }
              }
              const busIcon = divIcon({
                html: `<span class="fa-stack bus-stop-icon">
                        <i class="fa fa-circle fa-stack-2x bus-stop-icon-bg" style="color: ${color}"></i>
                        <i class="fa fa-stack-1x fa-bus bus-stop-icon-fg"></i>
                      </span>`,
                className: '',
                iconSize: [24, 24],
              })

              const marker = (
                <Marker
                  position={stopLatLng}
                  icon={busIcon}
                  zIndexOffset={isActive ? 1000 : 0}
                  ref={`${stop.id}`}
                  draggable={isActive}
                  onDragEnd={(e) => {
                    console.log(e)
                    let latlng = e.target.getLatLng()
                    let stopLatLng = this.getStopLatLng(latlng)
                    updateActiveEntity(activeEntity, 'stop', stopLatLng)
                    this.refs[`${stop.id}`].leafletElement.setLatLng(latlng)
                  }}
                  onClick={(e) => {
                    // set active entity
                    if (!isActive)
                      setActiveEntity(feedSource.id, 'stop', stop)
                  }}
                >
                </Marker>
              )

              return marker
          })
        : null
      }
    </FeatureGroup>
    )
  }
}
