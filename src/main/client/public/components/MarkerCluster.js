import React from 'react'
import Leaflet from 'leaflet'
// import MarkerPopup from './MarkerPopup'
import { MapLayer, Popup } from 'react-leaflet'

require('leaflet.markercluster')

class MarkerCluster extends MapLayer {
  componentWillMount () {
    super.componentWillMount()
    console.log('mounted')
    this.leafletElement = Leaflet.markerClusterGroup()
  }

  componentWillReceiveProps (nextProps) {
    super.componentWillReceiveProps(nextProps)
    console.log(nextProps.newMarkerData)
    // add markers to cluster layer
    if (nextProps.newMarkerData.length > 0) {
      let markers = Object.assign({}, this.props.markers)
      let newMarkers = []

      nextProps.newMarkerData.forEach((obj) => {
        let popup = React.renderToStaticMarkup(
          <Popup>
            <div>
              <h3>{obj.name}</h3>
            </div>
          </Popup>
        )

        let leafletMarker = Leaflet.marker(obj.latLng)
          .bindPopup(popup, {maxHeight: 350, maxWidth: 250, minWidth: 250})
          .on('click', () => this.props.map.panTo(obj.latLng))

        markers[obj.id] = leafletMarker
        newMarkers.push(leafletMarker)
      })

      this.leafletElement.addLayers(newMarkers)

      setTimeout(() => {
        this.props.updateMarkers(markers)
      }, 0)
    }

    // zoom to particular marker
    if (Object.keys(nextProps.focusMarker).length > 0) {
      let marker = this.props.markers[nextProps.focusMarker.id]

      this.leafletElement.zoomToShowLayer(marker, () => {
        this.props.map.panTo(nextProps.focusMarker.latLng)
        marker.openPopup()
      })
    }
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return null
  }
}

MarkerCluster.propTypes = {
  focusMarker: React.PropTypes.object,
  map: React.PropTypes.object,
  markers: React.PropTypes.object,
  newMarkerData: React.PropTypes.array,
  updateMarkers: React.PropTypes.func
}

MarkerCluster.defaultProps = {
  markers: {},
  newMarkerData: [],
  focusMarker: {}
}

export default MarkerCluster
