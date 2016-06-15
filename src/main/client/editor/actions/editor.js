import JSZip from 'jszip'

import { secureFetch } from '../../common/util/util'
import { fetchFeedVersions } from '../../manager/actions/feeds'


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

export function saveAgency (agency, feedId) {
  return function (dispatch, getState) {
    const data = {
      // defaultLat:"33.755",
      // defaultLon:"-84.39",
      gtfsAgencyId: agency.agency_id,
      id: agency.id !== -1 ? agency.id : "test_UUID", // generate UUID client side? http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
      lang: agency.agency_lang,
      name: agency.agency_name,
      phone: agency.agency_phone,
      // routeTypeId:"0f7313df-cb1a-4029-80f1-24620a86fa2e",
      sourceId: "277a268e-5b38-4aff-949c-b70517fb8224",
      timezone: agency.agency_timezone,
      url: agency.agency_url,
      // fare_url: agency.agency_fare_url,
    }
    const method = agency.id !== -1 ? 'put' : 'post'
    const url = agency.id !== -1
      ? `/api/manager/secure/agency/${agency.id}?feedId=${feedId}`
      : `/api/manager/secure/agency?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(validationIssues => {
        //console.log('got GTFS+ val result', validationResult)
        dispatch(receiveGtfsValidation(validationIssues))
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
        dispatch(receiveAgency(feedId, agencies))
      })
  }
}


//// ROUTES

export function saveRoute (route, feedId) {
  return function (dispatch, getState) {
    const data = {
      gtfsRouteId: route.route_id,
      agencyId: route.agency_id,
      routeShortName: route.route_short_name,
      routeLongName: route.route_long_name,
      routeDesc: route.route_desc,
      routeTypeId: route.route_type,
      routeUrl: route.route_url,
      routeColor: route.route_color,
      routeTextColor: route.route_text_color,
      gtfsAgencyId: route.route_id,
    }
    const method = route.id !== -1 ? 'put' : 'post'
    const url = route.id !== -1
      ? `/api/manager/secure/route/${route.id}?feedId=${feedId}`
      : `/api/manager/secure/route?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(validationIssues => {
        //console.log('got GTFS+ val result', validationResult)
        dispatch(receiveGtfsValidation(validationIssues))
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
      })
  }
}



//// STOPS

export function saveStop (stop, feedId) {
  return function (dispatch, getState) {
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

    }
    const method = stop.id !== -1 ? 'put' : 'post'
    const url = stop.id !== -1
      ? `/api/manager/secure/stop/${stop.id}?feedId=${feedId}`
      : `/api/manager/secure/stop?feedId=${feedId}`
    return secureFetch(url, getState(), method, data)
      .then(res => res.json())
      .then(stop => {
        //console.log('got GTFS+ val result', validationResult)
        dispatch(receiveGtfsValidation(stop))
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
      default:
        const url = `/api/manager/secure/${tableId}?feedId=${feedId}`
        return secureFetch(url, getState())
          .then(res => res.json())
          .then(entities => {
            console.log('got editor result', entities)
            dispatch(receiveGtfsTable(tableId, entities))
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
