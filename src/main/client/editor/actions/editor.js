import JSZip from 'jszip'

import { secureFetch } from '../../common/util/util'
import { fetchFeedVersions } from '../../manager/actions/feeds'

//// AGENCY

export function createAgency (agency, feedId) {
  return function (dispatch, getState) {
    const agency = {
      defaultLat:"33.755",
      defaultLon:"-84.39",
      gtfsAgencyId:"CCT GTFS",
      id:"6270524a-3802-4a59-b7ff-3e1d880a08b0",
      lang:"en",
      name:"CCT GTFS",
      phone:null,
      routeTypeId:"0f7313df-cb1a-4029-80f1-24620a86fa2e",
      sourceId:"277a268e-5b38-4aff-949c-b70517fb8224",
      timezone:"America/New_York",
      url:"http://test.com",
    }
    const url = `/api/manager/secure/agency?feedId=${feedId}`
    return secureFetch(url, getState(), 'post', agency)
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

export function createRoute (agency, feedId) {
  return function (dispatch, getState) {
    const agency = {
      defaultLat:"33.755",
      defaultLon:"-84.39",
      gtfsAgencyId:"CCT GTFS",
      id:"6270524a-3802-4a59-b7ff-3e1d880a08b0",
      lang:"en",
      name:"CCT GTFS",
      phone:null,
      routeTypeId:"0f7313df-cb1a-4029-80f1-24620a86fa2e",
      sourceId:"277a268e-5b38-4aff-949c-b70517fb8224",
      timezone:"America/New_York",
      url:"http://test.com",
    }
    const url = `/api/manager/secure/agency?feedId=${feedId}`
    return secureFetch(url, getState(), 'post', agency)
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
        dispatch(receiveRoutes(routes))
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
    const url = `/api/manager/secure/${tableId}?feedId=${feedId}`
    return secureFetch(url, getState())
      .then(res => res.json())
      .then(entities => {
        console.log('got editor result', entities)
        dispatch(receiveGtfsTable(tableId, entities))
      })
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
