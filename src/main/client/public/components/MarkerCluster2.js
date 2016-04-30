import React from 'react'
import { PropTypes } from 'react'
import { BaseTileLayer, MapLayer, Marker, Path } from 'react-leaflet'

import Leaflet from 'leaflet'
require('leaflet.markercluster')

export class MarkerCluster extends Path {
  componentWillMount () {
    super.componentWillMount()
    console.log('mounting')
    const { markers, map, ...props } = this.props
    this.leafletElement = Leaflet.markerClusterGroup()
    const newMarkers = markers.map( m => {
      return (
        <Marker position={m.position}/>
      )
    })
    console.log(newMarkers)
    this.leafletElement.addLayers(newMarkers)
    console.log('added markers')
  }

  // componentDidUpdate () {
  //   const { markers, map, ...props } = this.props
  //   map.removeLayer(this.leafletElement)
  //   this.leafletElement = Leaflet.markerClusterGroup()
  //   this.leafletElement.addLayers(markers.map( m => {
  //     return (
  //       <Marker position={m.position}/>
  //     )
  //   }))
  // }

  render () {
    return null
  }
}

MarkerCluster.propTypes = {
  markers: PropTypes.array.isRequired
}
