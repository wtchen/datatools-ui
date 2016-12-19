import update from 'react-addons-update'
import { latLngBounds } from 'leaflet'
import rbush from 'rbush'

import { getEntityBounds, stopToGtfs } from '../util/gtfs'

const defaultState = {
  zoom: null,
  bounds: latLngBounds([[60, 60], [-60, -20]]),
  target: null,
  stopTree: null
}

const mapState = (state = defaultState, action) => {
  let updatedState
  switch (action.type) {
    case 'RECEIVE_FEED_INFO':
      if (action.feedInfo && action.feedInfo.defaultLon && action.feedInfo.defaultLat) {
        return update(state, {
          bounds: {$set: getEntityBounds([action.feedInfo.defaultLon, action.feedInfo.defaultLat], 0.5)},
          target: {$set: action.feedInfo.id}
        })
      }
      return state
    case 'RECEIVE_STOPS':
      const tree = rbush(9, ['[0]', '[1]', '[0]', '[1]'])
      tree.load(action.stops.map(stopToGtfs).map(s => ([s.stop_lon, s.stop_lat, s])))
      return update(state, {
        stopTree: {$set: tree}
      })
    case 'RECEIVED_ROUTES_SHAPEFILE':
      return update(state, {
        routesGeojson: {$set: action.geojson}
      })
    case 'UPDATE_MAP_SETTING':
      updatedState = {}
      for (let key in action.props) {
        updatedState[key] = {$set: action.props[key]}
      }
      if (!('target' in action.props)) {
        updatedState.target = {$set: null}
      }
      return update(state, updatedState)
    default:
      return state
  }
}

export default mapState
