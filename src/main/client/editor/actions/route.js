import { secureFetch } from '../../common/util/util'
import { setActiveGtfsEntity } from './editor'

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
      publiclyVisible: route.publiclyVisible,
      status: route.status,

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
      .then(r => {
        return dispatch(fetchRoutes(feedId))
          .then((routes) => {
            if (route.id === 'new') {
              dispatch(setActiveGtfsEntity(feedId, 'route', r.id))
            }
            return r
          })
      })
  }
}

export function deletingRoute (feedId, routeId) {
  return {
    type: 'DELETING_ROUTE',
    feedId,
    routeId
  }
}

export function deleteRoute (feedId, routeId) {
  return function (dispatch, getState) {
    dispatch(deletingRoute(feedId, routeId))
    if (routeId === 'new') {
      return dispatch(fetchRoutes(feedId))
    }
    const url = `/api/manager/secure/route/${routeId}?feedId=${feedId}`
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

export function uploadRouteBranding (feedId, routeId, file) {
  return function (dispatch, getState) {
    console.log(file)
    var data = new FormData()
    data.append('file', file)
    console.log(data)
    const url = `/api/manager/secure/route/${routeId}/uploadbranding?feedId=${feedId}`
    return fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + getState().user.token },
      body: data
    }).then(res => res.json())
      .then(r => {
        return dispatch(fetchRoutes(feedId))
      })
  }
  // export function uploadFeed (feedSource, file) {
  //   return function (dispatch, getState) {
  //     dispatch(uploadingFeed())
  //     const url = `/api/manager/secure/feedversion?feedSourceId=${feedSource.id}`
  //
  //     var data = new FormData()
  //     data.append('file', file)
  //
      // return fetch(url, {
      //   method: 'post',
      //   headers: { 'Authorization': 'Bearer ' + getState().user.token },
      //   body: data
      // }).then(res => {
  //       if (res.status === 304) {
  //         dispatch(feedNotModified(feedSource, 'Feed upload cancelled because it matches latest feed version.'))
  //       }
  //       else if (res.status >= 400) {
  //         dispatch(setErrorMessage('Error uploading feed source'))
  //       }
  //       else {
  //         dispatch(uploadedFeed(feedSource))
  //         dispatch(startJobMonitor())
  //       }
  //       console.log('uploadFeed result', res)
  //
  //       // fetch feed source with versions
  //       return dispatch(fetchFeedSource(feedSource.id, true))
  //     })
  //   }
  // }
}
