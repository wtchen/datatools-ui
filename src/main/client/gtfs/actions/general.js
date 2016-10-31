import fetch from 'isomorphic-fetch'
import {
  fetchingStops,
  errorFetchingStops,
  receiveStops,
  clearStops
} from './stops'
import {
  fetchingPatterns,
  errorFetchingPatterns,
  receivePatterns,
  clearPatterns
} from './patterns'
import {
  fetchingRoutes,
  errorFetchingRoutes,
  receiveRoutes,
  clearRoutes
} from './routes'
import { stopsAndRoutes, compose, patternsAndStopsForBoundingBox } from  '../util/graphql'
import { getFeedId } from '../../common/util/modules'

export function clearGtfsElements () {
  return function (dispatch, getState) {
    dispatch(clearRoutes())
    dispatch(clearStops())
    dispatch(clearPatterns())
  }
}

function requestGtfsElements (feedIds, entities) {
  return {
    type: 'REQUESTING_GTFS_ELEMENTS',
    feedIds,
    entities
  }
}
//
function receivedGtfsElements (feedIds, stops, patterns) {
  return {
    type: 'RECEIVED_GTFS_ELEMENTS',
    feedIds,
    stops,
    patterns
  }
}

export const requestStopsAndRoutes = (feedIds, routeids, stopIds, module) => {
  return {
    type: 'REQUEST_GTFS_STOPS_AND_ROUTES',
    feedIds, routeids, stopIds, module
  }
}

export const receivedStopsAndRoutes = (results, module) => {
  return {
    type: 'RECEIVED_GTFS_STOPS_AND_ROUTES',
    results, module
  }
}

export function fetchStopsAndRoutes (entities, module) {
  return function (dispatch, getState) {
    let activeProject = getState().projects.active
    let feedId = []
    let routeId = []
    let stopId = []
    // map entities to entity IDs requested
    entities.map(e => {
      const feed = activeProject.feedSources.find(f => {
        return getFeedId(f) === e.entity.AgencyId
      })
      const id = getFeedId(feed)
      if (feedId.indexOf(id) === -1) {
        feedId.push(id)
      }
      if (routeId.indexOf(e.entity.RouteId) === -1) {
        routeId.push(e.entity.RouteId)
      }
      if (stopId.indexOf(e.entity.StopId) === -1) {
        stopId.push(e.entity.StopId)
      }
    })
    dispatch(requestStopsAndRoutes(feedId, routeId, stopId, module))
    return fetch(compose(stopsAndRoutes(feedId, routeId, stopId), {feedId, routeId, stopId}))
      .then((response) => {
        return response.json()
      })
      .then(results => {
        return dispatch(receivedStopsAndRoutes(results, module))
      })
  }
}

export function refreshGtfsElements (feedId, entities) {
  return function (dispatch, getState) {
    dispatch(requestGtfsElements(feedId, entities))
    const bounds = getState().gtfs.filter.map.bounds
    const max_lat = bounds.getNorth()
    const max_lon = bounds.getEast()
    const min_lat = bounds.getSouth()
    const min_lon = bounds.getWest()
    return fetch(compose(patternsAndStopsForBoundingBox(feedId, entities, max_lat, max_lon, min_lat, min_lon), {feedId, max_lat, max_lon, min_lat, min_lon}))
      .then((response) => {
        return response.json()
      })
      .then(results => {
        return dispatch(receivedGtfsElements(feedId, results.stops, results.patterns))
      })
  }
}
