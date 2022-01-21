// @flow

import React, { PureComponent } from 'react'
import {Polygon, Polyline} from 'react-leaflet'

import type {EditSettingsState, MapState} from '../../../types/reducers'
import type { GtfsLocation, Pattern } from '../../../types'
import {stopIsOutOfBounds} from '../../util/map'
import { addStopToPattern } from '../../actions/map/stopStrategies'

type Props = {
  activePattern: Pattern,
  editSettings: EditSettingsState,
  locations: Array<GtfsLocation>,
  mapState: MapState
}

type State = {

}

export default class AddableLocationsLayer extends PureComponent<Props, State> {
  render () {
    const {
      activePattern,
      editSettings,
      locations,
      mapState
    } = this.props

    const { bounds, zoom } = mapState
    const patternLocationIds = activePattern && activePattern.patternLocations
      ? activePattern.patternLocations.map(pl => pl.locationId)
      : []

    const showAddableLocations = locations && activePattern &&
      editSettings.addStops && zoom && zoom > 2 && bounds

    return (
      <div id='addable-locations-layer'>
        {showAddableLocations
          ? locations
            .filter(location => {
              // Filter out locations by that don't appear in the bounding box.
              if (stopIsOutOfBounds(location, bounds)) return false
              if (patternLocationIds.indexOf(location.location_id) !== -1) {
                // Filter out locations that exist in activePattern. These stops
                // already have their own markers on the map with popups that
                // have options to add the stops to the pattern again.
                return false
              }
              if (location.id < 0) {
                console.warn(`Location has a negative id, which indicates an unsaved entity that should not be selectable. Filtering out of map view.`, location)
                return false
              }
              return true
            })
            .map(location => {
              const groupedLocationShapePts = location.location_shapes.reduce((acc, cur) => {
                if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [[cur.geometry_pt_lat, cur.geometry_pt_lon]]
                else acc[cur.geometry_id].push([cur.geometry_pt_lat, cur.geometry_pt_lon])
                return acc
              }, {})

              if (!location) return null
              return (
                groupedLocationShapePts && Object.keys(groupedLocationShapePts).map(key => {
                  return (location.geometry_type === 'polygon'
                    ? <Polygon key={key}  positions={groupedLocationShapePts[key]} />
                    : <Polyline key={key} positions={groupedLocationShapePts[key]} />
                  )
                })
              )
            })
          : null
        }
      </div>
    )
  }
}

// TODO: make this component connected to redux
// add click handler to polygon and polyline that calls addStopToPattern