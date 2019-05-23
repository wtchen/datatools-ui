// @flow

import React, {Component} from 'react'
import {Browser} from 'leaflet'
import {
  TileLayer,
  FeatureGroup,
  LayersControl,
  Polyline,
  Tooltip
} from 'react-leaflet'

import {getUserMetadataProperty} from '../../../common/util/user'
import {isExtensionEnabled} from '../../../common/util/config'
import StopLayer from '../../../scenario-editor/components/StopLayer'
import {getMapLayers} from '../../util/map'

import type {GtfsStop} from '../../../types'
import type {ManagerUserState} from '../../../types/reducers'
import type {MapLayer} from '../../util/map'

type Props = {
  stops: Array<GtfsStop>,
  tripPatterns: Array<any>,
  user: ManagerUserState
}

type OverlayItem = {component: any, name: string}

export default class EditorMapLayersControl extends Component<Props> {
  render () {
    const { tripPatterns, stops, user } = this.props
    const { BaseLayer, Overlay } = LayersControl
    const OVERLAYS: Array<OverlayItem> = [
      {
        name: 'Route alignments',
        component: (
          <FeatureGroup>
            {tripPatterns
              ? tripPatterns.map((tp) => {
                if (!tp.latLngs) return null
                return (
                  <Polyline
                    key={tp.id}
                    positions={tp.latLngs}
                    weight={2}
                    color='#888'>
                    <Tooltip sticky>
                      <span>{tp.name} ({tp.route_id})</span>
                    </Tooltip>
                  </Polyline>
                )
              })
              : null
            }
          </FeatureGroup>
        )
      },
      {
        name: 'Stop locations',
        component: <StopLayer key='stop-layer' stops={stops} />
      }
    ]
    const MAP_LAYERS = getMapLayers()
    const activeMapLayerIndex: number = MAP_LAYERS.findIndex(
      (l: MapLayer) => l.id === getUserMetadataProperty(user.profile, 'editor.map_id')
    ) || MAP_LAYERS[0]
    const MAP_URL: string = process.env.MAP_URL
      ? process.env.MAP_URL
      : 'NO_URL_FOUND'
    const MAP_KEY: string = process.env.MAP_KEY
      ? process.env.MAP_KEY
      : 'NO_TOKEN_FOUND'
    const MAP_ATTRIBUTION: ?string = process.env.MAP_ATTRIBUTION
    return (
      <LayersControl position='topleft'>
        {MAP_LAYERS.map((layer: MapLayer, index: number) => (
          <BaseLayer
            name={layer.name}
            key={layer.id}
            checked={activeMapLayerIndex !== -1 ? index === activeMapLayerIndex : index === 0}>
            <TileLayer
              url={`//${MAP_URL}/${layer.id}/{z}/{x}/{y}${Browser.retina ? '@2x' : ''}.png?${MAP_KEY}`}
              attribution={MAP_ATTRIBUTION} />
          </BaseLayer>
        ))}
        {isExtensionEnabled('nysdot') &&
          <Overlay
            name='Route layer'
            key='route-layer'>
            <TileLayer
              url={`https://s3.amazonaws.com/datatools-nysdot/tiles/{z}_{x}_{y}${Browser.retina ? '@2x' : ''}.png`} />
          </Overlay>
        }
        {OVERLAYS.map((overlay: OverlayItem, i: number) => (
          <Overlay
            name={overlay.name}
            key={i}>
            {overlay.component}
          </Overlay>
        ))}
      </LayersControl>
    )
  }
}
