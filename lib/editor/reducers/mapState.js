import update from 'react-addons-update'
import { latLngBounds } from 'leaflet'

import { getEntityBounds } from '../util/gtfs'

const defaultState = {
  zoom: null,
  bounds: latLngBounds([[60, 60], [-60, -20]]),
  target: null
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
    case 'RECEIVED_ROUTES_SHAPEFILE':
      return update(state, {
        routesGeojson: {$set: action.geojson}
      })
    case 'UPDATE_MAP_SETTING':
      updatedState = {}
      for (const key in action.props) {
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
