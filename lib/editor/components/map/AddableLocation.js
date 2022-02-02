// @flow

import React, {Component} from 'react'
import {FeatureGroup, Polygon, Polyline, Popup} from 'react-leaflet'

import * as stopStrategiesActions from '../../actions/map/stopStrategies'
import AddPatternStopDropdown from '../pattern/AddPatternStopDropdown'
import type {GtfsLocation, Pattern} from '../../../types'

type Props = {
  activePattern: Pattern,
  addStopToPattern: typeof stopStrategiesActions.addStopToPattern,
  location: GtfsLocation
}

/**
 * This component is the location equivalent of AddableStop.
 * It renders the location on the map and provides a popup with further options
 */
export default class AddableLocation extends Component<Props> {
  _onClickAddStopToEnd = () => {
    const {activePattern, addStopToPattern, location} = this.props
    addStopToPattern(activePattern, location)
  }

  _onSelectStop = (key: number) =>
    this.props.addStopToPattern(this.props.activePattern, this.props.location, key)

  render () {
    const {
      activePattern,
      addStopToPattern,
      location
    } = this.props
    const stopName = `${location.stop_name || ''} (${location.location_id})`

    const Shape = location.geometry_type === 'polygon' ? Polygon : Polyline
    const groupedLocationShapePts = location.location_shapes.reduce((acc, cur) => {
      const coordinates = [cur.geometry_pt_lat, cur.geometry_pt_lon]

      if (!acc[cur.geometry_id]) acc[cur.geometry_id] = [coordinates]
      else acc[cur.geometry_id].push(coordinates)
      return acc
    }, {})

    return (
      <FeatureGroup>
        {groupedLocationShapePts &&
          Object.keys(groupedLocationShapePts).map((key) => <Shape key={key} positions={groupedLocationShapePts[key]} opacity={0.25} fillOpacity={0.15}>
            <Popup>
              <div style={{ minWidth: '180px' }}>
                <h5>{stopName}</h5>
                <AddPatternStopDropdown
                  activePattern={activePattern}
                  addStopToPattern={addStopToPattern}
                  label='Add location'
                  stop={location}
                />
              </div>
            </Popup>
          </Shape>
          )}
      </FeatureGroup>
    )
  }
}
