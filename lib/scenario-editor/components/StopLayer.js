/**
an optimized layer for drawing stops rapidly,
adapted from https://github.com/conveyal/leaflet-transit-editor/blob/master/lib/stop-layer.js
and subsequently https://github.com/conveyal/scenario-editor/blob/master/lib/map/transit-editor/stop-layer.js
*/

const MIN_ZOOM = 1 // don't draw stops below this zoom

import { GridLayer } from 'react-leaflet'
import { point, Canvas } from 'leaflet'

export default class StopLayer extends GridLayer {
  static defaultProps = {
    minZoom: MIN_ZOOM
  }

  componentWillMount () {
    super.componentWillMount()
    this.leafletElement = new Canvas({
      // retina: '@2x',
      detectRetina: true
    })
    this.leafletElement.drawTile = this.drawTile
    // this.leafletElement.on('click', this.onClick.bind(this))
  }
  // onClick = (e) => {
  //   console.log(e)
  // }
  drawTile = (cvs, tilePt, z) => {
    const tileLength = 256
    const {map} = this.context
    const {minZoom, stops} = this.props

    if (z < minZoom) return // don't draw every transit stop in a country

    const ctx = cvs.getContext('2d')
    ctx.strokeStyle = '#888'

    // get the bounds
    const topLeft = map.unproject([tilePt.x * tileLength, tilePt.y * tileLength], z)
    const brPoint = point([tilePt.x + 1, tilePt.y + 1])
    const botRight = map.unproject([brPoint.x * tileLength, brPoint.y * tileLength], z)

    // find relevant stops
    stops
      .filter((s) => s.stop_lat < topLeft.lat && s.stop_lat > botRight.lat && s.stop_lon > topLeft.lng && s.stop_lon < botRight.lng)
      .forEach((s) => {
        // get coordinates
        // lat first for leaflet, every so often Lineland seems like a good idea
        // http://www.gutenberg.org/ebooks/97
        let { x, y } = map.project([s.stop_lat, s.stop_lon], z)

        // we know they're in the current tile so we can be lazy and just modulo
        x %= tileLength
        y %= tileLength

        // center it up
        x -= 1
        y -= 1

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.stroke()
      })
  }
}
