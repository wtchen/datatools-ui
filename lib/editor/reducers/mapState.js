import update from 'react-addons-update'
import { latLngBounds } from 'leaflet'

import { getFeedBounds } from '../util/map'

export const defaultState = {
  zoom: null,
  bounds: latLngBounds([[60, 60], [-60, -20]]), // entire globe
  target: null
}

export const reducers = {
  'RECEIVE_FEEDSOURCE' (state, action) {
    return update(state, {
      bounds: {$set: latLngBounds(getFeedBounds(action.feedSource))},
      target: {$set: action.feedSource && action.feedSource.id}
    })
  },
  'RECEIVED_ROUTES_SHAPEFILE' (state, action) {
    return update(state, {
      routesGeojson: {$set: action.payload.geojson}
    })
  },
  'UPDATE_MAP_SETTING' (state, action) {
    const updatedState = {}
    for (const key in action.payload) {
      if (key === 'bounds' && !action.payload[key]) {
        // do nothing. Setting bounds to null would cause an error for Leaflet
      } else {
        updatedState[key] = {$set: action.payload[key]}
      }
    }
    if (!('target' in action.payload)) {
      // If no target present in payload, set to null (no target to focus on)
      updatedState.target = {$set: null}
    }
    return update(state, updatedState)
  }
}
