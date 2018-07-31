import Icon from '@conveyal/woonerf/components/icon'
import React, {Component, PropTypes} from 'react'
import { GeoJSON, Popup } from 'react-leaflet'
import { Button } from 'react-bootstrap'

import { getRouteName } from '../../editor/util/gtfs'

const COLORS = ['#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99']

export default class PatternGeoJson extends Component {
  static propTypes = {
    pattern: PropTypes.object,
    index: PropTypes.number,
    onRouteClick: PropTypes.func,
    popupAction: PropTypes.string,
    newEntityId: PropTypes.number
  }

  _onClickAction = () => {
    const {onRouteClick, newEntityId, pattern} = this.props
    const {feed, route} = pattern
    onRouteClick(route, feed, newEntityId)
  }

  _onEachFeature = (feature, layer) => {
    const {pattern} = this.props
    layer.feature.properties.patternId = pattern.pattern_id
  }

  render () {
    const {
      index = 0,
      onRouteClick,
      pattern,
      popupAction
    } = this.props
    if (!pattern) {
      return null
    }
    const {feed, route: routeArray} = pattern
    const route = Array.isArray(routeArray) ? routeArray[0] : routeArray
    const routeName = route ? getRouteName(route) : pattern.route_name
    const routeId = route ? route.route_id : pattern.route_id
    return (
      <GeoJSON
        color={COLORS[index % (COLORS.length - 1)]}
        data={pattern.geometry}
      >
        <Popup>
          <div>
            <p>
              <Icon type='bus' />{' '}
              <strong>{onRouteClick ? routeName : pattern.name}</strong>
            </p>
            <ul>
              <li><strong>Route ID:</strong> {routeId}</li>
              {feed &&
                <li><strong>Agency:</strong> {feed.name}</li>
              }
            </ul>
            {onRouteClick &&
              <Button
                bsStyle='primary'
                block
                onClick={this._onClickAction}>
                <Icon type='bus' /> {popupAction} route
              </Button>
            }
          </div>
        </Popup>
      </GeoJSON>
    )
  }
}
