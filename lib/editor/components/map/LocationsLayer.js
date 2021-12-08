// @flow

import { EditControl } from 'react-leaflet-draw'
import React, { PureComponent } from 'react'
import {FeatureGroup} from 'react-leaflet'

// import 'leaflet/dist/leaflet.draw.css'
// import 'leaflet-draw/dist/leaflet.draw.css'

type Props = {
  activeEntity: any
}

// const markerIcon = L.divIcon({
//   html: '<i class="fa fa-circle" style="color: #1b2f9e" />',
//   iconAnchor: [5, 8],
//   iconSize: [10, 10],
//   className: 'markerDivIcon'
// })

export default class LocationsLayer extends PureComponent<Props> {
  /* TODO:
    [ ] Polygon vertex editing
      [ ] Move points
      [x] Delete points
      [x] Add points
    [ ] Draw multiple polgyons
    [ ] Allow drawing lineString, multiLineString
    [ ] Randomize the polygon colour?
  */
  // We need to move this function to be a prop in a HOC so that we can connect it to the store for dispatch...
  _onClick (e) {
    console.log('Marker onclick fired')
  }

  _onDragEnd (e) {
    // Update the point's lat/lon
    // console.log(e.target._latlng)
    console.log(e)
  }
  _onMouseDown (e) {
    // disable map dragging, need to pass map? Or edit the settings?
    console.log('Mouse down fired')
    console.log(this.props.onMouseMove)
  }s
  _onRightClick (e) {
    // const {
    //   activeEntity,
    //   updateLocationPolygon
    // } = this.props
    // const {lat, lng} = e.latlng
    // const locationPolygons = activeEntity.locationPolygons

    // // Delete the point from locationPolygons
    // // TODO: delete based on key, lat/lons could be skipped due to precision
    // const editedPolygons = locationPolygons.filter(coords => {
    //   return !(coords[0] === lat && coords[1] === lng)
    // })
    // updateLocationPolygon(editedPolygons)
    console.log('right clicked')
  }

  _onCreate (e) {
    // TODO: handle polylines
    const { layerType, layer } = e
    if (layerType === 'polygon') {
      // Deconstruct leaflet polygon
      const location = layer.getLatLngs()[0].map(point => [point.lat, point.lng])
      // LOCATIONS.push({id: _leaflet_id, latlngs: layer.getLatLngs()[0]})
      console.log('created location:', location)
    }
  }

  render () {
    return (
      <div id='location-features-layer'>
        <FeatureGroup>
          <EditControl
            draw={{
              circle: false,
              circlemarker: false,
              marker: false,
              rectangle: false
            }}
            onCreated={this._onCreate}
            position='topleft'
          />
        </FeatureGroup>
      </div>
    )
  }
}
