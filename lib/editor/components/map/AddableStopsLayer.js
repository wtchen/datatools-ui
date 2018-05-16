import React, { Component, PropTypes } from 'react'
import {FeatureGroup} from 'react-leaflet'

import AddableStop from './AddableStop'

export default class AddableStopsLayer extends Component {
  static propTypes = {
    activePattern: PropTypes.object,
    addStopToPattern: PropTypes.func,
    editSettings: PropTypes.object,
    mapState: PropTypes.object,
    stops: PropTypes.array
  }

  _isStopOutOfBounds = (stop, bounds) => {
    return stop.stop_lat > bounds.getNorth() ||
      stop.stop_lat < bounds.getSouth() ||
      stop.stop_lon > bounds.getEast() ||
      stop.stop_lon < bounds.getWest()
  }

  render () {
    const {
      activePattern,
      addStopToPattern,
      editSettings,
      mapState,
      stops
    } = this.props
    const { bounds, zoom } = mapState
    const patternStopIds = activePattern && activePattern.patternStops
      ? activePattern.patternStops.map(ps => ps.stopId)
      : []
    const showAddableStops = stops && activePattern &&
      editSettings.addStops && zoom > 14 && bounds
    return (
      <FeatureGroup id='addable-stops-layer'>
        {showAddableStops
          ? stops
            .filter(stop => {
              if (this._isStopOutOfBounds(stop, bounds)) {
                // Filter out stops by that don't appear in the bounding box.
                return false
              }
              if (patternStopIds.indexOf(stop.stop_id) !== -1) {
                // Filter out stops that exist in activePattern. These stops
                // already have their own markers on the map with popups that
                // have options to add the stops to the pattern again.
                return false
              }
              if (stop.id < 0) {
                console.warn(`Stop has a negative id, which indicates an unsaved entity that should not be selectable. Filtering out of map view.`, stop)
                return false
              }
              return true
            })
            .map(stop => {
              if (!stop) return null
              return (
                <AddableStop
                  activePattern={activePattern}
                  addStopToPattern={addStopToPattern}
                  stop={stop}
                  key={stop.id} />
              )
            })
          : null
        }
      </FeatureGroup>
    )
  }
}
