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
        console.log('>>>>>>>>> got main gtfs zip', zip);
        let filenames = []
        let filePromises = []
        zip.forEach((path, file) => {
          if(DT_CONFIG.modules.gtfsplus.spec.find(t => t.id === path.split('.')[0])) {
            console.log(' gen promise for '+ path);
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
