// @flow

import React, {Component} from 'react'
import {Browser} from 'leaflet'
import {
  LayersControl,
  TileLayer
} from 'react-leaflet'

import {getUserMetadataProperty} from '../../../common/util/user'
import {isExtensionEnabled} from '../../../common/util/config'
import {defaultTileLayerProps, EDITOR_MAP_LAYERS} from '../../../common/util/maps'
import StopLayer from '../../../scenario-editor/components/StopLayer'

import type {GtfsStop, MapLayer} from '../../../types'
import type {ManagerUserState} from '../../../types/reducers'

type Props = {
  stops: Array<GtfsStop>,
  tripPatterns: Array<any>,
  user: ManagerUserState
}

type OverlayItem = {component: any, name: string}

export default class EditorMapLayersControl extends Component<Props> {
  render () {
    const { stops, user } = this.props
    const { BaseLayer, Overlay } = LayersControl
    const OVERLAYS: Array<OverlayItem> = [
      // FIXME: Do not show trip pattern overlay because it can cause out of
      // memory issues for very large GTFS feeds.
      // {
      //   name: 'Route alignments',
      //   component: (
      //     <FeatureGroup>
      //       {tripPatterns
      //         ? tripPatterns.map((tp) => {
      //           if (!tp.latLngs) return null
      //           return (
      //             <Polyline
      //               key={tp.id}
      //               positions={tp.latLngs}
      //               weight={2}
      //               color='#888'>
      //               <Tooltip sticky>
      //                 <span>{tp.name} ({tp.route_id})</span>
      //               </Tooltip>
      //             </Polyline>
      //           )
      //         })
      //         : null
      //       }
      //     </FeatureGroup>
      //   )
      // },
      {
        name: 'Stop locations',
        component: <StopLayer key='stop-layer' stops={stops} />
      }
    ]
    const activeMapLayerIndex: number = EDITOR_MAP_LAYERS.findIndex(
      (l: MapLayer) => l.id === getUserMetadataProperty(user.profile, 'editor.map_id')
    )
    return (
      <LayersControl position='topleft'>
        {EDITOR_MAP_LAYERS.map((layer: MapLayer, index: number) => (
          <BaseLayer
            name={layer.name}
            key={layer.id}
            checked={activeMapLayerIndex !== -1 ? index === activeMapLayerIndex : index === 0}>
            <TileLayer {...defaultTileLayerProps(layer.id)} />
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
