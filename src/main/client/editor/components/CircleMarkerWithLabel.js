import React, {Component, PropTypes} from 'react'
import { CircleMarker } from 'react-leaflet'
import { circleMarker } from 'leaflet'
require('leaflet.label')

// Use the same code as CircleMarker, just customise componentWillMount()
export default class CircleMarkerWithLabel extends CircleMarker {
   // Add the relevant prop types for Leaflet.label
   static propTypes = {
    label: PropTypes.string.isRequired,
    labelOptions: PropTypes.object,
    center: PropTypes.array,
  };

  componentWillMount() {
    super.componentWillMount();
    // Extract label and labelOptions from props
    const { label, labelOptions, map, center, ...props } = this.props;
    // Call bindLabel() as documented in Leaflet.label
    this.leafletElement = circleMarker(center, props).bindLabel(label, labelOptions);
  }

  componentDidUpdate(prevProps) {
    if (this.props.center !== prevProps.center) {
      this.leafletElement.setLatLng(this.props.center);
    }
    this.setStyleIfChanged(prevProps, this.props);
    // Eventually handle specific logic if props change
  }
}
