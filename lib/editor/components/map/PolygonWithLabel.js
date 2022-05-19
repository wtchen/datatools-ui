// @flow

import { Polygon as LeafletPolygon } from 'leaflet'
import { LatLng, Path, PathProps, withLeaflet } from 'react-leaflet'

type LeafletElement = LeafletPolygon
type Props = {
  positions: LatLng[] | LatLng[][] | LatLng[][][],
} & PathProps

class Polygon extends Path<LeafletElement, Props> {
  createLeafletElement (props: Props): LeafletElement {
    return new LeafletPolygon(props.positions, this.getOptions(props))
  }

  updateLeafletElement (fromProps: Props, toProps: Props) {
    if (toProps.positions !== fromProps.positions) {
      this.leafletElement.setLatLngs(toProps.positions)
    }
    this.setStyleIfChanged(fromProps, toProps)
    this.leafletElement.unbindTooltip()
    this.leafletElement.bindTooltip(this.props.tooltip, {className: 'stop-sequence', permanent: true, direction: 'center', interactive: false, sticky: false}).openTooltip()
  }
}

export default withLeaflet<Props, Polygon>(Polygon)
