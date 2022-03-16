// @flow

import { polygon } from 'leaflet'
import {Path} from 'react-leaflet'

export default class PolygonWithLabel extends Path {
  createLeafletElement (props: Object): Object {
    const { positions, ...options } = props
    const p = polygon(positions, this.getOptions(options))
    return p
  }

  updateLeafletElement (fromProps: Object, toProps: Object) {
    if (toProps.positions !== fromProps.positions) {
      this.leafletElement.setLatLngs(toProps.positions)
    }
    this.setStyleIfChanged(fromProps, toProps)
    this.leafletElement.unbindTooltip()
    this.leafletElement.bindTooltip(this.props.tooltip, {className: 'stop-sequence', permanent: true, direction: 'center', interactive: false, sticky: false}).openTooltip()
  }
}
