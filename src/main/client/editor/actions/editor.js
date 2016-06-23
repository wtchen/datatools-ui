import JSZip from 'jszip'

import { secureFetch } from '../../common/util/util'
import { fetchFeedVersions } from '../../manager/actions/feeds'
import { browserHistory } from 'react-router'

export function settingActiveGtfsEntity (feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId) {
  return {
    type: 'SETTING_ACTIVE_GTFS_ENTITY',
    feedSourceId,
    component,
    entityId,
    subComponent,
    subEntityId,
    subSubComponent,
    subSubEntityId
  }
}

export function setActiveGtfsEntity (feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId) {
  return function (dispatch, getState) {
    let previousFeedSourceId = getState().editor.feedSourceId
    if (previousFeedSourceId && feedSourceId !== previousFeedSourceId) {
      dispatch(clearGtfsContent())
    }
    dispatch(settingActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
    const url = entityId && subEntityId && subSubComponent && subSubEntityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/${subSubComponent}/${subSubEntityId}`
      : entityId && subEntityId && subSubComponent
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/${subSubComponent}`
      : entityId && subEntityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}`
      : entityId && subComponent
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}`
      : entityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}`
      : `/feed/${feedSourceId}/edit/${component}`
    if (getState().routing.locationBeforeTransitions.path !== url) {
      browserHistory.push(url)
    }
  }
}

export function saveActiveGtfsEntity () {
  return function (dispatch, getState) {
    let feedSourceId = getState().editor.feedSourceId
    let entity = getState().editor.activeEntity
    let component = getState().editor.activeComponent
    // dispatch(savingActiveGtfsEntity(feedSourceId, component, entity))
    switch (component) {
      case 'stop':
        return dispatch(saveStop(feedSourceId, entity))
      case 'route':
        return dispatch(saveRoute(feedSourceId, entity))
      case 'agency':
        return dispatch(saveAgency(feedSourceId, entity))
    }
  }
}

export function deleteGtfsEntity (feedId, component, entity) {
  return function (dispatch, getState) {
    switch (component) {
      case 'stop':
        return dispatch(deleteStop(feedId, entity))
      case 'route':
        return dispatch(deleteRoute(feedId, entity))
      case 'agency':
        return dispatch(deleteAgency(feedId, entity))
      case 'trippattern':
        return dispatch(deleteTripPattern(feedId, entity))
    }
  }
}

export function updateActiveGtfsEntity (props) {
  return {
    type: 'UPDATE_ACTIVE_GTFS_ENTITY',
    props
  }
}

export function createGtfsEntity (feedSourceId, component, props) {
  return {
    type: 'CREATE_GTFS_ENTITY',
    feedSourceId,
    component,
    props
  }
}

export function newGtfsEntity (feedSourceId, component, props) {
  return function (dispatch, getState) {
    dispatch(createGtfsEntity(feedSourceId, component, props))
    if ('routeId' in props) {
      dispatch(setActiveGtfsEntity(feedSourceId, 'route', props.routeId, component, 'new'))
    }
    else {
      dispatch(setActiveGtfsEntity(feedSourceId, component, 'new'))
    }
  }
}

// export function

//// FEED_INFO

export function requestingFeedInfo (feedId) {
  return {
    type: 'REQUESTING_FEED_INFO',
    feedId
  }
}

export function receiveFeedInfo (feedInfo) {
  return {
    type: 'RECEIVE_FEED_INFO',
    feedInfo
  }
}

export function savingFeedInfo (feedId) {
  return {
    type: 'SAVING_FEED_INFO',
    feedId
  }
}

export function fetchFeedInfo (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedInfo(feedId))
    const url = `/api/manager/secure/feedinfo/${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(feedInfo => {
        dispatch(receiveFeedInfo(feedInfo))
      })
  }
}

////// Create new feed info

// export function saveFeedInfo (props) {
//   return function (dispatch, getState) {
//     dispatch(savingFeedInfo())
//     const url = '/api/manager/secure/feedsource'
//     return secureFetch(url, getState(), 'post', props)
//       .then((res) => {
//         return dispatch(fetchProjectWithFeeds(props.projectId))
//       })
//   }
// }

export function updateFeedInfo (feedInfo, changes) {
  return function (dispatch, getState) {
    dispatch(savingFeedInfo(feedInfo.id))
    const url = `/api/manager/secure/feedinfo/${feedInfo.id}`
    return secureFetch(url, getState(), 'put', changes)
      .then(res => res.json())
      .then(feedInfo => {
        dispatch(receiveFeedInfo(feedInfo))
      })
  }
}

//// AGENCY

export function savingAgency (feedId, agency) {
  return {
    type: 'SAVING_AGENCY',
    feedId,
    agency
  }
}

export function receiveAgency (feedId, agency) {
  return {
    type: 'RECEIVE_AGENCY',
    feedId,
    agency
  }
}

export function saveAgency (feedId, agency) {
  return function (dispatch, getState) {
    const data = {
      // defaultLat:"33.755",
      // defaultLon:"-84.39",
      gtfsAgencyId: agency.agency_id,
      lang: agency.agency_lang,
      feedId: agency.feedId,
      name: agency.agency_name,
      phone: agency.agency_phone,
      // routeTypeId:"0f7313df-cb1a-4029-80f1-24620a86fa2e",
      sourceId: "277a268e-5b38-4aff-949c-b70517fb8224",
      timezone: agency.agency_timezone,
      url: agency.agency_url,
      // fare_url: agency.agency_fare_url,
    }
    const method = agency.id !== 'new' ? 'put' : 'post'
    const url = agency.id !== 'new'
      ? `/api/manager/secure/agency/${agency.id}?feedId=${feedId}`
      : `/api/manager/secure/agency?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(agency => {
        // dispatch(receiveAgency(feedId, agency))
        dispatch(fetchAgencies(feedId))
      })
  }
}

export function requestingAgencies (feedId) {
  return {
    type: 'REQUESTING_AGENCIES',
    feedId
  }
}

export function receiveAgencies (feedId, agencies) {
  return {
    type: 'RECEIVE_AGENCIES',
    feedId,
    agencies
  }
}

export function fetchAgencies (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingAgencies(feedId))
    const url = `/api/manager/secure/agency?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(agencies => {
        dispatch(receiveAgencies(feedId, agencies))
        return agencies
      })
  }
}

export function deletingAgency (feedId, agency) {
  return {
    type: 'DELETING_AGENCY',
    feedId,
    agency
  }
}

export function deleteAgency (feedId, agency) {
  return function (dispatch, getState) {
    dispatch(deletingAgency(feedId, agency))
    if (agency.id === 'new') {
      return dispatch(fetchAgencies(feedId))
    }
    const url = `/api/manager/secure/agency/${agency.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(agency => {
        dispatch(fetchAgencies(feedId))
      })
  }
}

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
    const data = {
      gtfsRouteId: route.route_id,
      agencyId: route.agency_id,
      feedId: route.feedId,
      routeShortName: route.route_short_name,
      routeLongName: route.route_long_name,
      routeDesc: route.route_desc,
      routeTypeId: route.route_type,
      routeUrl: route.route_url,
      routeColor: route.route_color,
      routeTextColor: route.route_text_color,
    }
    const method = route.id !== 'new' ? 'put' : 'post'
    const url = route.id !== 'new'
      ? `/api/manager/secure/route/${route.id}?feedId=${feedId}`
      : `/api/manager/secure/route?feedId=${feedId}`
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

//// TRIP PATTERNS

export function requestingTripPatternsForRoute (feedId, routeId) {
  return {
    type: 'REQUESTING_TRIP_PATTERNS_FOR_ROUTE',
    feedId,
    routeId
  }
}

export function receiveTripPatternsForRoute (feedId, routeId, tripPatterns) {
  return {
    type: 'RECEIVE_TRIP_PATTERNS_FOR_ROUTE',
    feedId,
    routeId,
    tripPatterns
  }
}

export function fetchTripPatternsForRoute (feedId, routeId) {
  return function (dispatch, getState) {
    dispatch(requestingTripPatternsForRoute(feedId))
    const url = `/api/manager/secure/trippattern?feedId=${feedId}&routeId=${routeId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 400) {
          // dispatch(setErrorMessage('Error getting stops for trip pattern'))
          return []
        }
        return res.json()
      })
      .then(tripPatterns => {
        dispatch(receiveTripPatternsForRoute(feedId, routeId, tripPatterns))
        return tripPatterns
      })
  }
}

export function deletingTripPattern (feedId, tripPattern) {
  return {
    type: 'DELETING_TRIP_PATTERN',
    feedId,
    tripPattern
  }
}

export function deleteTripPattern (feedId, tripPattern) {
  return function (dispatch, getState) {
    dispatch(deletingTripPattern(feedId, tripPattern))
    const routeId = tripPattern.routeId
    if (tripPattern.id === 'new') {
      return dispatch(fetchTripPatternsForRoute(feedId, routeId))
    }
    const url = `/api/manager/secure/trippattern/${tripPattern.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(tripPattern => {
        dispatch(fetchTripPatternsForRoute(feedId, routeId))
      })
  }
}

export function requestingTripsForCalendar (feedId, pattern, calendarId) {
  return {
    type: 'REQUESTING_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId
  }
}

export function receiveTripsForCalendar (feedId, pattern, calendarId, trips) {
  return {
    type: 'RECEIVE_TRIPS_FOR_CALENDAR',
    feedId,
    pattern,
    calendarId,
    trips
  }
}

export function fetchTripsForCalendar (feedId, pattern, calendarId) {
  return function (dispatch, getState) {
    dispatch(requestingTripsForCalendar(feedId, pattern, calendarId))
    const url = `/api/manager/secure/trip?feedId=${feedId}&patternId=${pattern.id}&calendarId=${calendarId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(trips => {
        dispatch(receiveTripsForCalendar(feedId, pattern, calendarId, trips))
      })
  }
}

// export function fetchTripsForCalendar (feedId, patternId, calendarId) {
//   return function (dispatch, getState) {
//     dispatch(requestingTripsForCalendar(feedId, patternId, calendarId))
//     const url = `/api/manager/secure/trip?feedId=${feedId}&patternId=${patternId}&calendarId=${calendarId}`
//     return secureFetch(url, getState())
//       .then(res => res.json())
//       .then(trips => {
//         dispatch(receiveTripsForCalendar(feedId, patternId, calendarId, trips))
//       })
//   }
// }


//// STOPS

export function savingStop (feedId, stop) {
  return {
    type: 'SAVING_STOP',
    feedId,
    stop
  }
}

export function receiveStop (feedId, stop) {
  return {
    type: 'RECEIVE_STOP',
    feedId,
    stop
  }
}

export function saveStop (feedId, stop) {
  return function (dispatch, getState) {
    dispatch(savingStop(feedId, stop))
    const data = {
      gtfsStopId: stop.stop_id,
      stopCode: stop.stop_code,
      stopName: stop.stop_name,
      stopDesc: stop.stop_desc,
      lat: stop.stop_lat,
      lon: stop.stop_lon,
      zoneId: stop.zone_id,
      stopUrl: stop.stop_url,
      locationType: stop.location_type,
      parentStation: stop.parent_station,
      stopTimezone: stop.stop_timezone,
      wheelchairBoarding: stop.wheelchair_boarding,
      bikeParking: stop.bikeParking,
      carParking: stop.carParking,
      pickupType: stop.pickupType,
      dropOffType: stop.dropOffType,
      feedId: stop.feedId,
    }
    const method = stop.id !== 'new' ? 'put' : 'post'
    const url = stop.id !== 'new'
      ? `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
      : `/api/manager/secure/stop?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(stop => {
        // dispatch(receiveStop(feedId, stop))
        dispatch(fetchStops(feedId))
      })
  }
}

export function requestingStops (feedId) {
  return {
    type: 'REQUESTING_STOPS',
    feedId
  }
}

export function receiveStops (feedId, stops) {
  return {
    type: 'RECEIVE_STOPS',
    feedId,
    stops
  }
}

export function fetchStops (feedId) {
  return function (dispatch, getState) {
    dispatch(requestingStops(feedId))
    const url = `/api/manager/secure/stop?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(stops => {
        dispatch(receiveStops(feedId, stops))
        return stops
      })
  }
}

export function fetchStopsForTripPattern (feedId, tripPatternId) {
  return function (dispatch, getState) {
    dispatch(requestingStops(feedId))
    const url = `/api/manager/secure/stop?feedId=${feedId}&patternId=${tripPatternId}`
    return secureFetch(url, getState())
      .then(res => {
        if (res.status >= 400) {
          // dispatch(setErrorMessage('Error getting stops for trip pattern'))
          return []
        }
        return res.json()
      })
      .then(stops => {
        dispatch(receiveStops(feedId, stops))
        return stops
      })
  }
}

export function deletingStop (feedId, stop) {
  return {
    type: 'DELETING_STOP',
    feedId,
    stop
  }
}

export function deleteStop (feedId, stop) {
  return function (dispatch, getState) {
    dispatch(deletingStop(feedId, stop))
    if (stop.id === 'new') {
      return dispatch(fetchStops(feedId))
    }
    const url = `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(route => {
        dispatch(fetchStops(feedId))
      })
  }
}


/////// GENERIC TABLE ACTIONS + OLD GTFS+ ACTIONS PORTED OVER

export function receiveGtfsTable (tableId, entities) {
  return {
    type: 'RECEIVE_GTFSEDITOR_TABLE',
    tableId,
    entities
  }
}

export function getGtfsTable (tableId, feedId) {
  return function (dispatch, getState) {
    switch (tableId) {
      case 'stop':
        return dispatch(fetchStops(feedId))
      case 'route':
        return dispatch(fetchRoutes(feedId))
      case 'agency':
        return dispatch(fetchAgencies(feedId))
      // case 'timetable':
      //   return dispatch(fetchRoutes(feedId))
      default:
        const url = `/api/manager/secure/${tableId}?feedId=${feedId}`
        return secureFetch(url, getState())
          .then(res => res.json())
          .then(entities => {
            console.log('got editor result', entities)
            dispatch(receiveGtfsTable(tableId, entities))
            return entities
          })
    }
  }
}

export function saveGtfsRow (tableId, rowIndex, feedId) {
  return function (dispatch, getState) {
    // const table = DT_CONFIG.modules.editor.spec.find(t => t.id === tableId)
    // for(const field of table.fields) {
    //   rowData[field.name] = null
    // }
    const data = getState().editor.tableData[tableId][rowIndex]
    console.log(data)
    // const data = {
    //   defaultLat:"33.755",
    //   defaultLon:"-84.39",
    //   gtfsAgencyId:"CCT GTFS",
    //   id:"6270524a-3802-4a59-b7ff-3e1d880a08b0",
    //   lang:"en",
    //   name:"CCT GTFS",
    //   phone:null,
    //   routeTypeId:"0f7313df-cb1a-4029-80f1-24620a86fa2e",
    //   sourceId:"277a268e-5b38-4aff-949c-b70517fb8224",
    //   timezone:"America/New_York",
    //   url:"http://test.com",
    // }
    const url = `/api/manager/secure/${tableId}?feedId=${feedId}`
    return secureFetch(url, getState(), 'post', data)
      .then(res => res.json())
      .then(entity => {
        console.log('got editor result', entity)
        // dispatch(receiveGtfsValidation(validationIssues))
      })
  }
}

// EDIT ACTIVE GTFS+ ACTIONS

export function addGtfsRow (tableId) {
  const table = DT_CONFIG.modules.editor.spec.find(t => t.id === tableId)

  let rowData = {}
  for(const field of table.fields) {
    const editorField = field.name.split(/_(.+)?/)[1]
    rowData[editorField] = null
  }

  return {
    type: 'ADD_GTFSEDITOR_ROW',
    tableId,
    rowData
  }
}

export function updateGtfsField (tableId, rowIndex, fieldName, newValue) {
  return {
    type: 'UPDATE_GTFSEDITOR_FIELD',
    tableId,
    rowIndex,
    fieldName,
    newValue
  }
}

export function deleteGtfsRow (tableId, rowIndex) {
  return {
    type: 'DELETE_GTFSEDITOR_ROW',
    tableId,
    rowIndex
  }
}


// DOWNLOAD/RECEIVE DATA ACTIONS

export function requestingGtfsContent () {
  return {
    type: 'REQUESTING_GTFSEDITOR_CONTENT',
  }
}

export function clearGtfsContent () {
  return {
    type: 'CLEAR_GTFSEDITOR_CONTENT',
  }
}

export function receiveGtfsContent (feedVersionId, filenames, fileContent, timestamp) {
  return {
    type: 'RECEIVE_GTFSEDITOR_CONTENT',
    feedVersionId,
    filenames,
    fileContent,
    timestamp
  }
}

export function downloadGtfsFeed (feedVersionId) {
  return function (dispatch, getState) {
    dispatch(requestingGtfsContent())

    const fetchFeed = fetch('/api/manager/secure/gtfsplus/'+  feedVersionId, {
      method: 'get',
      cache: 'default',
      headers: { 'Authorization': 'Bearer ' + getState().user.token }
    }).then((response) => {
      if(response.status !== 200) {
        console.log('error downloading gtfs+ feed', response.statusCode)
        dispatch(clearGtfsContent())
      }
      return response.blob()
    })

    const fetchTimestamp = secureFetch(`/api/manager/secure/gtfsplus/${feedVersionId}/timestamp`, getState())
    .then(response => response.json())

    Promise.all([fetchFeed, fetchTimestamp]).then(([feed, timestamp]) => {
      JSZip.loadAsync(feed).then((zip) => {
        let filenames = []
        let filePromises = []
        zip.forEach((path,file) => {
          filenames.push(path)
          filePromises.push(file.async('string'))
        })
        Promise.all(filePromises).then(fileContent => {
          dispatch(receiveGtfsContent(feedVersionId, filenames, fileContent, timestamp))
          dispatch(validateGtfsFeed(feedVersionId))
        })
      })
    })
  }
}

// VALIDATION ACTIONS

export function validatingGtfsFeed () {
  return {
    type: 'VALIDATING_GTFSEDITOR_FEED',
  }
}

export function receiveGtfsValidation (validationIssues) {
  return {
    type: 'RECEIVE_GTFSEDITOR_VALIDATION',
    validationIssues
  }
}

export function validateGtfsFeed (feedVersionId) {
  return function (dispatch, getState) {
    dispatch(validatingGtfsFeed())
    const url = `/api/manager/secure/gtfsplus/${feedVersionId}/validation`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(validationIssues => {
        //console.log('got GTFS+ val result', validationResult)
        dispatch(receiveGtfsValidation(validationIssues))
      })
  }
}

// UPLOAD ACTIONS

export function uploadingGtfsFeed () {
  return {
    type: 'UPLOADING_GTFSEDITOR_FEED',
  }
}

export function uploadedGtfsFeed () {
  return {
    type: 'UPLOADED_GTFSEDITOR_FEED',
  }
}

export function uploadGtfsFeed (feedVersionId, file) {
  return function (dispatch, getState) {
    dispatch(uploadingGtfsFeed())
    const url = `/api/manager/secure/gtfsplus/${feedVersionId}`
    var data = new FormData()
    data.append('file', file)

    return fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + getState().user.token },
      body: data
    }).then(result => {
      return dispatch(uploadedGtfsFeed())
    })
  }
}

// GTFS ENTITY LOOKUP ACTIONS

export function receiveGtfsEntities (gtfsEntities) {
  return {
    type: 'RECEIVE_GTFS_ENTITIES',
    gtfsEntities
  }
}

export function loadGtfsEntities (tableId, rows, feedSource) {

  return function (dispatch, getState) {

    // lookup table for mapping tableId:fieldName keys to inputType values
    const typeLookup = {}
    const getDataType = function(tableId, fieldName) {
      const lookupKey = tableId + ':' + fieldName
      if(lookupKey in typeLookup) return typeLookup[lookupKey]
      const fieldInfo = DT_CONFIG.modules.editor.spec
        .find(t => t.id === tableId).fields.find(f => f.name === fieldName)
      if(!fieldInfo) return null
      typeLookup[lookupKey] = fieldInfo.inputType
      return fieldInfo.inputType
    }

    // determine which routes, stops, etc. aren't currently in the gtfsEntityLookup table and need to be loaded from the API
    const routesToLoad = []
    const stopsToLoad = []

    const currentLookup = getState().editor.gtfsEntityLookup

    for(const rowData of rows) {
      for(const fieldName in rowData) {
        switch(getDataType(tableId, fieldName)) {
          case 'GTFS_ROUTE':
            const routeId = rowData[fieldName]
            if(routeId && !(`route_${routeId}` in currentLookup)) routesToLoad.push(routeId)
            break;
          case 'GTFS_STOP':
            const stopId = rowData[fieldName]
            if(stopId && !(`stop_${stopId}` in currentLookup)) stopsToLoad.push(stopId)
            break;
        }
      }
    }

    if(routesToLoad.length === 0 && stopsToLoad.length === 0) return

    var loadRoutes = Promise.all(routesToLoad.map(routeId => {
      const url = `/api/manager/routes/${routeId}?feed=${feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    var loadStops = Promise.all(stopsToLoad.map(stopId => {
      const url = `/api/manager/stops/${stopId}?feed=${feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    Promise.all([loadRoutes, loadStops]).then(results => {
      const loadedRoutes = results[0]
      const loadedStops = results[1]
      dispatch(receiveGtfsEntities(loadedRoutes.concat(loadedStops)))
    })
  }
}

// PUBLISH ACTIONS

export function publishingGtfsFeed () {
  return {
    type: 'PUBLISHING_GTFSEDITOR_FEED',
  }
}

export function publishGtfsFeed (feedVersion) {
  return function (dispatch, getState) {
    dispatch(publishingGtfsFeed())
    const url = `/api/manager/secure/gtfsplus/${feedVersion.id}/publish`
    return secureFetch(url, getState(), 'post')
      .then((res) => {
        console.log('published done');
        return dispatch(fetchFeedVersions(feedVersion.feedSource))
      })
  }
}

// SNAPSHOT ACTIONS

export function requestingSnapshots () {
  return {
    type: 'REQUESTING_GTFSEDITOR_SNAPSHOTS'
  }
}

export function receiveSnapshots (feedSource, snapshots) {
  return {
    type: 'RECEIVE_GTFSEDITOR_SNAPSHOTS',
    feedSource,
    snapshots
  }
}

export function fetchSnapshots (feedSource) {
  return function (dispatch, getState) {
    dispatch(requestingSnapshots())
    const url = `/api/manager/secure/snapshot?feedSourceId=${feedSource.id}`
    return secureFetch(url, getState(), 'get')
      .then((response) => {
        return response.json()
      }).then((snapshots) => {
        dispatch(receiveSnapshots(feedSource, snapshots))
      })
  }
}
