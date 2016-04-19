import JSZip from 'jszip'

export function addGtfsPlusRow (tableId) {
  const table = DT_CONFIG.modules.gtfsplus.spec.find(t => t.id === tableId)

  let rowData = {}
  for(const field of table.fields) {
    rowData[field.name] = null
  }

  return {
    type: 'ADD_GTFSPLUS_ROW',
    tableId,
    rowData
  }
}

export function updateGtfsPlusField (tableId, rowIndex, fieldName, newValue) {
  return {
    type: 'UPDATE_GTFSPLUS_FIELD',
    tableId,
    rowIndex,
    fieldName,
    newValue
  }
}

export function deleteGtfsPlusRow (tableId, rowIndex) {
  return {
    type: 'DELETE_GTFSPLUS_ROW',
    tableId,
    rowIndex
  }
}

export function clearGtfsPlusContent () {
  return {
    type: 'CLEAR_GTFSPLUS_CONTENT',
  }
}

export function receiveGtfsPlusContent (filenames, fileContent) {
  return {
    type: 'RECEIVE_GTFSPLUS_CONTENT',
    filenames,
    fileContent
  }
}

export function downloadGtfsPlusFeed (feedSourceId) {
  return function (dispatch, getState) {
    fetch('/api/manager/secure/gtfsplus/'+  feedSourceId, {
      method: 'get',
      cache: 'default',
      headers: { 'Authorization': 'Bearer ' + getState().user.token }
    }).then((response) => {
      if(response.status !== 200) {
        console.log('error downloading gtfs+ feed', response.statusCode)
        dispatch(clearGtfsPlusContent())
      }
      return response.blob()
    }).then((blob) => {
      JSZip.loadAsync(blob).then((zip) => {
        let filenames = []
        let filePromises = []
        zip.forEach((path,file) => {
          filenames.push(path)
          filePromises.push(file.async('string'))
        })
        Promise.all(filePromises).then(fileContent => {
          dispatch(receiveGtfsPlusContent(filenames, fileContent))
        })
      })
    })
  }
}

export function uploadGtfsPlusFeed (feedSourceId, file) {
  return function (dispatch, getState) {
    const url = `/api/manager/secure/gtfsplus?feedSourceId=${feedSourceId}`
    var data = new FormData()
    data.append('file', file)

    return fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + getState().user.token },
      body: data
    }).then(result => {
      console.log('uploadGtfsPlusFeed result', result)
    })
  }
}

export function importGtfsPlusFromGtfs (versionId) {
  return function (dispatch, getState) {
    fetch(`/api/manager/secure/gtfsplus/import/${versionId}`, {
      method: 'get',
      cache: 'default',
      headers: { 'Authorization': 'Bearer ' + getState().user.token }
    }).then((response) => {
      if(response.status !== 200) {
        console.log('error downloading gtfs feed', response.statusCode)
        return null
      }
      return response.blob()
    }).then((blob) => {
      JSZip.loadAsync(blob).then((zip) => {
        let filenames = []
        let filePromises = []
        zip.forEach((path, file) => {
          if(DT_CONFIG.modules.gtfsplus.spec.find(t => t.id === path.split('.')[0])) {
            filenames.push(path)
            filePromises.push(file.async('string'))
          }
        })
        Promise.all(filePromises).then(fileContent => {
          dispatch(receiveGtfsPlusContent(filenames, fileContent))
        })
      })
    })
  }
}

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
      const fieldInfo = DT_CONFIG.modules.gtfsplus.spec
        .find(t => t.id === tableId).fields.find(f => f.name === fieldName)
      if(!fieldInfo) return null
      typeLookup[lookupKey] = fieldInfo.inputType
      return fieldInfo.inputType
    }

    // determine which routes, stops, etc. aren't currently in the gtfsEntityLookup table and need to be loaded from the API
    const routesToLoad = []
    const stopsToLoad = []

    const currentLookup = getState().gtfsplus.gtfsEntityLookup

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
