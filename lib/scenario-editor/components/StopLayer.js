/**
an optimized layer for drawing stops rapidly,
adapted from https://github.com/conveyal/leaflet-transit-editor/blob/master/lib/stop-layer.js
and subsequently https://github.com/conveyal/scenario-editor/blob/master/lib/map/transit-editor/stop-layer.js
*/

const MIN_ZOOM = 1 // don't draw stops below this zoom
const TILE_LENGTH = 256

import { GridLayer } from 'react-leaflet'
import { point } from 'leaflet'

export default class StopLayer extends GridLayer {
  static defaultProps = {
    minZoom: MIN_ZOOM
  }
  createLeafletElement (props: Object): Object {
    // const { url, ...options } = props
    const gl = super.createLeafletElement(props)
    gl.createTile = this.createTile
    console.log('creating GridLayer', gl)
    return gl
  }
  createTile = (coords) => {
    const {map} = this.context
    const {minZoom, stops} = this.props
    if (coords.z < minZoom) return // don't draw every transit stop in a country

    // create a <canvas> element for drawing
    const tile = document.createElement('canvas')
    tile.width = tile.height = TILE_LENGTH
    this.drawTile(tile, coords, map, stops)
    return tile
  }
  drawTile = (canvas, coords, map, stops) => {
    // get a canvas context and draw something on it using coords.x, coords.y and coords.z
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#888'

    // get the bounds
    const topLeft = map.unproject([coords.x * TILE_LENGTH, coords.y * TILE_LENGTH], coords.z)
    const brPoint = point([coords.x + 1, coords.y + 1])
    const botRight = map.unproject([brPoint.x * TILE_LENGTH, brPoint.y * TILE_LENGTH], coords.z)

    // find relevant stops
    stops
      .filter((s) => s.stop_lat < topLeft.lat && s.stop_lat > botRight.lat && s.stop_lon > topLeft.lng && s.stop_lon < botRight.lng)
      .forEach((s) => {
        // get coordinates
        // lat first for leaflet, every so often Lineland seems like a good idea
        // http://www.gutenberg.org/ebooks/97
        let { x, y } = map.project([s.stop_lat, s.stop_lon], coords.z)

        // we know they're in the current tile so we can be lazy and just modulo
        x %= TILE_LENGTH
        y %= TILE_LENGTH

        // center it up
        x -= 1
        y -= 1

        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.stroke()
      })
  }
}
