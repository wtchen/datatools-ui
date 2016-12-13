import React, { Component, PropTypes } from 'react'
import { divIcon } from 'leaflet'
import { Marker, FeatureGroup } from 'react-leaflet'

import {clickToLatLng} from '../../util/map'

export default class StopsLayer extends Component {
  static propTypes = {
    mapState: PropTypes.object
  }
  render () {
    const {
      mapState,
      stopTree,
      drawStops,
      activeEntity,
      updateActiveEntity,
      setActiveEntity,
      feedSource
    } = this.props
    const paddedBounds = mapState.bounds.pad(0.05)
    var results = stopTree && drawStops
      ? stopTree.search({
        minX: paddedBounds.getWest(),
        minY: paddedBounds.getSouth(),
        maxX: paddedBounds.getEast(),
        maxY: paddedBounds.getNorth()
      })
      : []
    if (activeEntity && results.findIndex(r => r[2].id === activeEntity.id) === -1) {
      results.push([0, 0, activeEntity])
    }
    console.log(results)
    const outOfZoom = !drawStops
    // console.log(mapState.bounds, paddedBounds)
    return (
      <FeatureGroup>
        {results
          ? results.map(result => {
            const stop = result[2]
            const isActive = activeEntity && activeEntity.id === stop.id
            const busIcon = divIcon({
              html: `<span title="${stop.stop_name}" class="fa-stack bus-stop-icon" style="opacity: 0.6">
                      <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
                      <i class="fa fa-bus fa-stack-1x" style="color: #000000"></i>
                    </span>`,
              className: '',
              iconSize: [24, 24]
            })
            const activeBusIcon = divIcon({
              html: `<span title="${stop.stop_name}" class="fa-stack bus-stop-icon">
                      <i class="fa fa-circle fa-stack-2x bus-stop-icon-bg" style="color: #000"></i>
                      <i class="fa fa-stack-1x fa-bus fa-inverse bus-stop-icon-fg"></i>
                    </span>`,
              className: '',
              iconSize: [24, 24]
            })
            const hidden = !isActive && outOfZoom
            if (hidden) {
              return null
            }
            if (isNaN(stop.stop_lat) || isNaN(stop.stop_lon)) {
              return null
            }
            const marker = (
              <Marker
                position={[stop.stop_lat, stop.stop_lon]}
                icon={isActive ? activeBusIcon : busIcon}
                zIndexOffset={isActive ? 1000 : 0}
                key={`${stop.id}`}
                ref={`${stop.id}`}
                // label={`${index + 1} - ${stop.stop_name}`}
                // opacity={hidden ? 0 : 1.0}
                draggable={isActive}
                onDragEnd={(e) => {
                  console.log(e)
                  let latlng = e.target.getLatLng()
                  let stopLatLng = clickToLatLng(latlng)
                  updateActiveEntity(activeEntity, 'stop', stopLatLng)
                  this.refs[`${stop.id}`].leafletElement.setLatLng(latlng)
                }}
                onClick={(e) => {
                  // set active entity
                  if (!isActive) {
                    setActiveEntity(feedSource.id, 'stop', stop)
                  }
                }}
              />
            )
            return marker
          })
          : null
        }
      </FeatureGroup>
    )
  }
}
