import React, {Component, PropTypes} from 'react'
import { Marker } from 'react-leaflet'
import { marker } from 'leaflet'
require('leaflet.label')

// Use the same code as Marker, just customise componentWillMount()
export default class MarkerWithLabel extends Marker {
   // Add the relevant prop types for Leaflet.label
   static propTypes = {
    label: PropTypes.string.isRequired,
    labelOptions: PropTypes.object,
    position: PropTypes.array,
  };

  componentWillMount() {
    super.componentWillMount()
    // Extract label and labelOptions from props
    const { label, labelOptions, map, position, ...props } = this.props
    // Call bindLabel() as documented in Leaflet.label
    this.leafletElement = marker(position, props).bindLabel(label, labelOptions)
  }

  componentDidUpdate(prevProps) {
    if (this.props.position !== prevProps.position) {
      this.leafletElement.setLatLng(this.props.position)
    }
    // this.setStyleIfChanged(prevProps, this.props)
    // Eventually handle specific logic if props change
  }
}
