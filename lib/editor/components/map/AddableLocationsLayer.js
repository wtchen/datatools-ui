// @flow

import React from 'react'

import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import type {EditSettingsState, MapState} from '../../../types/reducers'
import type { GtfsLocation, Pattern } from '../../../types'
import {stopIsOutOfBounds} from '../../util/map'

import AddableLocation from './AddableLocation'

type Props = {
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  editSettings: EditSettingsState,
  locations: Array<GtfsLocation>,
  mapState: MapState
}

/**
 * Renders AddableLocations that should be shown in the current map view.
 * Analagous to AddableStopsLayer
 */
const AddableLocationsLayer = ({activePattern, addStopToPattern, editSettings, locations, mapState}: Props) => {
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
            // Filter out locations that don't appear in the bounding box.
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
                return <AddableLocation addStopToPattern={addStopToPattern} activePattern={activePattern} location={location} />
              })
            )
          })
        : null
      }
    </div>
  )
}

export default AddableLocationsLayer
