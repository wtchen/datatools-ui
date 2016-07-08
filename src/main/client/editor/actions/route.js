import { secureFetch } from '../../common/util/util'

//// ROUTES

export function savingRoute (feedId, route) {
  return {
    type: 'SAVING_ROUTE',
    feedId,
    route
  }
}

export function receiveRoute (feedId, route) {
  return {
    type: 'RECEIVE_ROUTE',
    feedId,
    route
  }
}

export function saveRoute (feedId, route) {
  return function (dispatch, getState) {
    const method = route.id !== 'new' ? 'put' : 'post'
    const url = route.id !== 'new'
      ? `/api/manager/secure/route/${route.id}?feedId=${feedId}`
      : `/api/manager/secure/route?feedId=${feedId}`
    const data = {
      gtfsRouteId: route.route_id,
      agencyId: route.agency_id,
      feedId: route.feedId,
      routeBrandingUrl: route.routeBrandingUrl,
      routeShortName: route.route_short_name,
      routeLongName: route.route_long_name,
      routeDesc: route.route_desc,
      gtfsRouteType: route.route_type,
      routeUrl: route.route_url,
      routeColor: route.route_color,
      routeTextColor: route.route_text_color,
      id: route.id === 'new' ? null : route.id,
    }
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(route => {
        // dispatch(receiveRoute(feedId, route))
        dispatch(fetchRoutes(feedId))
      })
  }
}

export function deletingRoute (feedId, route) {
  return {
    type: 'DELETING_ROUTE',
    feedId,
    route
  }
}

export function deleteRoute (feedId, route) {
  return function (dispatch, getState) {
    dispatch(deletingRoute(feedId, route))
    if (route.id === 'new') {
      return dispatch(fetchRoutes(feedId))
    }
    const url = `/api/manager/secure/route/${route.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(route => {
        dispatch(fetchRoutes(feedId))
      })
  }
}

export function requestingRoutes (feedId) {
  return {
    type: 'REQUESTING_ROUTES',
    feedId
  }
}

export function receiveRoutes (feedId, routes) {
  return {
    type: 'RECEIVE_ROUTES',
    feedId,
    routes
  }
}

export function fetchRoutes (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingRoutes(feedId))
    const url = `/api/manager/secure/route?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(routes => {
        dispatch(receiveRoutes(feedId, routes))
        return routes
      })
  }
}
