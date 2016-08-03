import JSZip from 'jszip'
import faker from 'faker'

import { secureFetch, generateUID, generateRandomInt, generateRandomColor, idealTextColor } from '../../common/util/util'
import { componentList, subComponentList, subSubComponentList } from '../util/gtfs'
import { fetchFeedVersions } from '../../manager/actions/feeds'
import { browserHistory } from 'react-router'
import {
  fetchFeedInfo,
  saveFeedInfo,
  deleteFeedInfo,
  updateFeedInfo,
  createFeedInfo,
} from '../actions/feedInfo'
import {
  fetchAgencies,
  fetchAgency,
  saveAgency,
  deleteAgency,
  updateAgency,
} from '../actions/agency'
import {
  fetchStops,
  fetchStop,
  saveStop,
  deleteStop,
  updateStop,
  fetchStopsForTripPattern,
} from '../actions/stop'
import {
  fetchRoutes,
  fetchRoute,
  saveRoute,
  deleteRoute,
  updateRoute,
} from '../actions/route'
import {
  fetchFares,
  fetchFare,
  saveFare,
  deleteFare,
  updateFare,
} from '../actions/fare'
import {
  fetchTripPatternsForRoute,
  fetchTripPattern,
  saveTripPattern,
  deleteTripPattern,
  updateTripPattern,
} from '../actions/tripPattern'
import {
  fetchTripsForCalendar,
  fetchTrip,
  saveTrip,
  deleteTrip,
  updateTrip,
} from '../actions/trip'
import {
  fetchCalendars,
  fetchCalendar,
  saveCalendar,
  deleteCalendar,
  updateCalendar,
  fetchScheduleExceptions,
  fetchScheduleException,
  saveScheduleException,
  deleteScheduleException,
  updateScheduleException,
} from '../actions/calendar'

export function toggleEditSetting (setting) {
  return {
    type: 'TOGGLE_EDIT_SETTING',
    setting
  }
}

export function updateMapSetting (props) {
  return {
    type: 'UPDATE_MAP_SETTING',
    props
  }
}

//// SINGLE ENTITY ACTIONS

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
    if (getState().editor.editGeometry) {
      dispatch(toggleEditGeometry())
    }
    let url = entityId && subEntityId && subSubComponent && subSubEntityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/${subSubComponent}/${subSubEntityId}`
      : entityId && subEntityId && subSubComponent
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/${subSubComponent}`
      : entityId && subEntityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}`
      : entityId && subComponent
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}`
      : entityId
      ? `/feed/${feedSourceId}/edit/${component}/${entityId}`
      : component
      ? `/feed/${feedSourceId}/edit/${component}`
      : `/feed/${feedSourceId}/edit/`
    if (component && componentList.indexOf(component) === -1) {
      url = `/feed/${feedSourceId}/edit/`
    }
    else if (subComponent && subComponentList.indexOf(subComponent) === -1) {
      url = `/feed/${feedSourceId}/edit/${component}/${entityId}/`
    }
    else if (subSubComponent && subSubComponentList.indexOf(subSubComponent) === -1) {
      url = `/feed/${feedSourceId}/edit/${component}/${entityId}/${subComponent}/${subEntityId}/`
    }
    if (entityId === 'new' && (!getState().editor.tableData[component] || getState().editor.tableData[component].findIndex(e => e.id === 'new') === -1)) {
      dispatch(createGtfsEntity(feedSourceId, component))
    }
    if (!getState().routing.locationBeforeTransitions || !getState().routing.locationBeforeTransitions.pathname || getState().routing.locationBeforeTransitions.pathname !== url) {
      browserHistory.push(url)
    }
    dispatch(settingActiveGtfsEntity(feedSourceId, component, entityId, subComponent, subEntityId, subSubComponent, subSubEntityId))
  }
}

export function savingActiveGtfsEntity (component, entity) {
  return {
    type: 'SAVING_ACTIVE_GTFS_ENTITY',
    component,
    entity
  }
}

export function saveActiveGtfsEntity (component, optionalEntity) {
  return function (dispatch, getState) {
    let entity, feedId
    switch (component) {
      case 'stop':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveStop(feedId, entity))
      case 'route':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveRoute(feedId, entity))
      case 'agency':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveAgency(feedId, entity))
      case 'trippattern':
        let route = getState().editor.active.entity
        let patternId = getState().editor.active.subEntityId
        entity = optionalEntity || route.tripPatterns.find(p => p.id === patternId)
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveTripPattern(feedId, entity))
      case 'calendar':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveCalendar(feedId, entity))
      case 'scheduleexception':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveScheduleException(feedId, entity))
      case 'fare':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.feedId || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveFare(feedId, entity))
      case 'feedinfo':
        entity = optionalEntity || getState().editor.active.entity
        feedId = entity.id || getState().editor.active.feedSourceId
        dispatch(savingActiveGtfsEntity(component, entity))
        return dispatch(saveFeedInfo(feedId, entity))
      default:
        console.log('no action specified!')
        return
    }
  }
}
export function deletingEntity (feedId, component, entityId) {
  return {
    type: 'DELETING_ENTITY',
    feedId,
    component,
    entityId
  }
}

export function deleteGtfsEntity (feedId, component, entityId, routeId) {
  return function (dispatch, getState) {
    dispatch(deletingEntity(feedId, component, entityId))
    if (entityId === 'new') {
      return dispatch(getGtfsTable(component, feedId))
    }
    const url = `/api/manager/secure/${component}/${entityId}?feedId=${feedId}`
    return secureFetch(url, getState(), 'delete')
      .then(res => res.json())
      .then(entity => {
        if (component === 'trippattern' && routeId) {
          dispatch(fetchTripPatternsForRoute(feedId, routeId))
        }
        else {
          dispatch(getGtfsTable(component, feedId))
        }
      })
  }
}

export function updateActiveGtfsEntity (entity, component, props) {
  return {
    type: 'UPDATE_ACTIVE_GTFS_ENTITY',
    entity,
    component,
    props
  }
}

export function resetActiveGtfsEntity (entity, component) {
  return {
    type: 'RESET_ACTIVE_GTFS_ENTITY',
    entity,
    component
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

export function cloneGtfsEntity (feedSourceId, component, entityId, save) {
  return function (dispatch, getState) {
    if (entityId === 'new') {
      return null
    }
    let props = {...getState().editor.tableData[component].find(e => e.id === entityId)}
    props.id = 'new'
    switch (component) {
      case 'trippattern':
        props.name = props.name + ' copy'
        break
    }
    dispatch(newGtfsEntity(feedSourceId, component, props, save))
  }
}

export function newGtfsEntity (feedSourceId, component, props, save) {
  return function (dispatch, getState) {
    if (!props) {
      const generateProps = (component) => {
        let agency = getState().editor.tableData.agency ? getState().editor.tableData.agency[0] : null
        let color = generateRandomColor()
        switch (component) {
          case 'route':
            return {
              route_id: generateUID(),
              agency_id: agency ? agency.id : null,
              route_short_name: generateRandomInt(1, 300),
              route_long_name: faker.address.streetName(),
              route_color: color,
              route_text_color: idealTextColor(color),
              route_type: getState().editor.tableData.feedinfo && getState().editor.tableData.feedinfo.defaultRouteType !== null ? getState().editor.tableData.feedinfo.defaultRouteType : 3,
            }
          case 'stop':
            let stopId = generateUID()
            return {
              stop_id: stopId,
              stop_name: faker.address.streetName(),
              stop_lat: 0,
              stop_lon: 0,
              // route_color: color,
              // route_text_color: idealTextColor(color),
              // route_type: getState().editor.tableData.feedinfo && getState().editor.tableData.feedinfo.routeTypeId !== null ? getState().editor.tableData.feedinfo.routeTypeId : 3,
            }
          case 'scheduleexception':
            return {
              dates: []
            }
          case 'trippattern':
            return {
              // patternStops: [],
            }
        }
      }
      props = generateProps(component)
    }
    if (save) {
      dispatch(saveActiveGtfsEntity(component, props))
      // .then((entity) => {
      //   if (props && 'routeId' in props) {
      //     dispatch(setActiveGtfsEntity(feedSourceId, 'route', props.routeId, component, entity.id))
      //   }
      //   else {
      //     console.log('setting after save')
      //     dispatch(setActiveGtfsEntity(feedSourceId, component, entity.id))
      //   }
      // })
    } else {
      dispatch(createGtfsEntity(feedSourceId, component, props))
      if (props && 'routeId' in props) {
        // console.log('setting after create')
        dispatch(setActiveGtfsEntity(feedSourceId, 'route', props.routeId, component, 'new'))
      }
      else {
        console.log('setting after create')
        dispatch(setActiveGtfsEntity(feedSourceId, component, 'new'))
      }
    }

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
      case 'calendar':
        return dispatch(fetchCalendars(feedId))
      case 'fare':
        return dispatch(fetchFares(feedId))
      case 'scheduleexception':
        return dispatch(fetchScheduleExceptions(feedId))
      case 'feedinfo':
        return dispatch(fetchFeedInfo(feedId))
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

export function fetchBaseGtfs (feedId) {
  return function (dispatch, getState) {
    const tablesToFetch = ['calendar', 'agency', 'route', 'stop']
    dispatch(fetchFeedInfo(feedId))
    for (var i = 0; i < tablesToFetch.length; i++) {
      dispatch(getGtfsTable(tablesToFetch[i], feedId))
    }
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
