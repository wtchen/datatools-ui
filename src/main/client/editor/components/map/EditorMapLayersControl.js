import React, { Component, PropTypes } from 'react'
import { Browser } from 'leaflet'
import { TileLayer, FeatureGroup, LayersControl, Polyline } from 'react-leaflet'

import { getUserMetadataProperty } from '../../../common/util/user'
import { getConfigProperty } from '../../../common/util/config'
import StopLayer from '../../../scenario-editor/components/StopLayer'
import { MAP_LAYERS } from '../../util/map'

export default class EditorMapLayersControl extends Component {
  static propTypes = {
    tripPatterns: PropTypes.array,
    user: PropTypes.object,
    stops: PropTypes.array
  }
  render () {
    const { tripPatterns, stops, user } = this.props
    const OVERLAYS = [
      {
        name: 'Route alignments',
        component: <FeatureGroup>
          {tripPatterns ? tripPatterns.map((tp) => {
            if (!tp.latLngs) return null
            return <Polyline key={`static-${tp.id}`} positions={tp.latLngs} weight={2} color='#888' />
          }) : null}
        </FeatureGroup>
      },
      {
        name: 'Stop locations',
        component: <StopLayer stops={stops} />
      }
    ]
    const activeMapLayerIndex = MAP_LAYERS.findIndex(l => l.id === getUserMetadataProperty(user.profile, 'editor.map_id'))
    return (
      <LayersControl position='topleft'>
        {MAP_LAYERS.map((layer, index) => (
          <LayersControl.BaseLayer
            name={layer.name}
            key={layer.id}
            checked={activeMapLayerIndex !== -1 ? index === activeMapLayerIndex : index === 0}>
            <TileLayer
              url={`https://api.tiles.mapbox.com/v4/${layer.id}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?access_token=${getConfigProperty('mapbox.access_token')}`}
              attribution='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>' />
          </LayersControl.BaseLayer>
        ))}
        {OVERLAYS.map((overlay, i) => (
          <LayersControl.Overlay
            name={overlay.name}
            key={i}>
            {overlay.component}
          </LayersControl.Overlay>
        ))}
      </LayersControl>
    )
  }
}
