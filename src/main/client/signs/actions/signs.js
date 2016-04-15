import { push } from 'react-router-redux'
import { browserHistory } from 'react-router'

import { getSignConfigUrl, getDisplaysUrl } from '../../common/util/modules'
import moment from 'moment'

// signs management action

let nextSignId = 0
let nextStopEntityId = 100

export function createSign (entity, agency) {
  return function (dispatch, getState) {
    nextSignId--
    let entities = []

    if (entity) {
      nextStopEntityId++
      let type = typeof entity.stop_id !== 'undefined' ? 'STOP' : 'ROUTE'
      let newEntity = {
        id: nextStopEntityId,
        type: type
      }

      if (agency !== null)
        newEntity.agency = agency

      const typeKey = type.toLowerCase()
      newEntity[typeKey] = entity
      entities.push(newEntity)
    }

    const sign = {
      id: nextSignId,
      title: 'New Configuration',
      affectedEntities: entities,
      published: false,
      displays: []
    }
    browserHistory.push('/signs/newsign')
    dispatch(updateActiveSign(sign))
  }
}

/*export const createSign = (entity) => {
  nextSignId--
  let entities = []
  if (entity) {
    nextStopEntityId++
    let type = typeof entity.stop_id !== 'undefined' ? 'STOP' : 'ROUTE'
    let newEntity = {
      id: nextStopEntityId,
      type: type
    }
    const typeKey = type.toLowerCase()
    newEntity[typeKey] = entity
    entities.push(newEntity)
  }
  return {
    type: 'CREATE_SIGN',
    sign: {
      id: nextSignId,
      title: 'New Sign',
      affectedEntities: entities,
      published: false
    }
  }
}*/

/*export const saveSign = (sign) => {
  return {
    type: 'SAVE_SIGN',
    sign
  }
}*/

/*export const editSign = (sign) => {
  return {
    type: 'EDIT_SIGN',
    sign
  }
}*/

export const deleteSign = (sign) => {
  return function (dispatch, getState){
    console.log('deleting', sign)
    const user = getState().user
    const url = getSignConfigUrl() + '/' + sign.id
    const method = 'delete'
    console.log('url/method', url, method)
    fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.token
      }
    }).then((res) => {
      console.log('status='+res.status)
      browserHistory.push('/signs')
      dispatch(fetchRtdSigns())
    })
  }
}

export const requestRtdSigns = () => {
  return {
    type: 'REQUEST_RTD_SIGNS',
  }
}

export const receivedGtfsEntities = (gtfsObjects, gtfsSigns) => {
  return {
    type: 'RECEIVED_GTFS_ENTITIES',
    gtfsObjects,
    gtfsSigns
  }
}


export const receivedRtdSigns = (rtdSigns, activeProject) => {
  return {
    type: 'RECEIVED_RTD_SIGNS',
    rtdSigns,
    activeProject
  }
}

export function setActiveSign (signId) {
  return function (dispatch, getState) {
    const sign = getState().signs.all.find(a => a.id === signId)
    dispatch(updateActiveSign(sign))
  }
}

export function fetchRtdSigns () {
  return function (dispatch, getState) {
    dispatch(requestRtdSigns())
    return fetch(getSignConfigUrl()).then((res) => {
      return res.json()
    }).then((signs) => {
      return dispatch(receivedRtdSigns(signs, getState().projects.active))
    }).then(() => {
      let feed = getState().projects.active
      const fetchFunctions = getState().signs.entities.map((entity) => {
          return fetchEntity(entity, feed)
      })
      return Promise.all(fetchFunctions)
      .then((results) => {
        let newEntities = getState().signs.entities
        for (var i = 0; i < newEntities.length; i++) {
          newEntities[i].gtfs = results[i]
        }
        dispatch(receivedGtfsEntities(newEntities, getState().signs.all))
      }).then((error) => {
        console.log('error', error)
      })

    })
  }
}
// TODO: implement method for single sign fetch
// export const requestRtdSign = () => {
//   return {
//     type: 'REQUEST_RTD_SIGN',
//   }
// }
//
// export const receivedRtdSign = (rtdSigns, activeProject) => {
//   return {
//     type: 'RECEIVED_RTD_SIGN',
//     rtdSigns,
//     activeProject
//   }
// }
//
// export function fetchRtdSign(signId) {
//   return function (dispatch, getState) {
//     dispatch(requestRtdSign())
//     return fetch(getSignConfigUrl() + '/' + signId).then((res) => {
//       return res.json()
//     }).then((sign) => {
//       const project = getState().projects.active
//       return dispatch(receivedRtdSigns([sign], project))
//     }).then(() => {
//       let feed = getState().projects.active
//       const fetchFunctions = getState().signs.entities.map((entity) => {
//           return fetchEntity(entity, feed)
//       })
//       return Promise.all(fetchFunctions)
//       .then((results) => {
//         let newEntities = getState().signs.entities
//         for (var i = 0; i < newEntities.length; i++) {
//           newEntities[i].gtfs = results[i]
//         }
//         const signs = getState().signs.all
//         const sign = signs.find(a => a.id === +signId)
//         dispatch(receivedGtfsEntities(newEntities, signs))
//         console.log('this sign', sign)
//         dispatch(updateActiveSign(sign))
//       }).then((error) => {
//         console.log('error', error)
//       })
//
//     })
//   }
// }

export const updateActiveSign = (sign) => {
  return {
    type: 'UPDATE_ACTIVE_SIGN',
    sign
  }
}

export function editSign(sign) {
  return function (dispatch, getState) {
    dispatch(updateActiveSign(sign))
    browserHistory.push('/signs/sign/'+sign.id)
  }
}

export function fetchEntity(entity, activeProject) {
  const feed = activeProject.feedSources.find(f => f.externalProperties.MTC.AgencyId === entity.entity.AgencyId)
  const url = entity.type === 'stop' ? `/api/manager/stops/${entity.entity.StopId}?feed=${feed.externalProperties.MTC.AgencyId}` : `/api/manager/routes/${entity.entity.RouteId}?feed=${feed.externalProperties.MTC.AgencyId}`
  return fetch(url)
  .then((response) => {
    return response.json()
  })
  .then((object) => {
    return object
  }).catch((error) => {
    // console.log('caught', error)
  })
}

export function saveDisplay(display) {
  const url = display.Id < 0 ? getDisplaysUrl() : getDisplaysUrl() + display.Id
  const method = display.Id < 0 ? 'post' : 'put'
  return fetch(url, method)
  .then((response) => {
    return response.json()
  })
  .then((object) => {
    return object
  }).catch((error) => {
    // console.log('caught', error)
  })
}

export function saveSign(sign) {
  return function (dispatch, getState) {
    console.log('saving...')
    const user = getState().user
    var json = {
      Id: sign.id < 0 ? null : sign.id,
      ConfigurationDescription: sign.title || 'New Configuration',
      Published: sign.published ? 'Published' : 'Unpublished',
      DisplayConfigurationDetails: sign.affectedEntities.map((entity) => {
        console.log('ent', entity)
        return {
          Id: entity.id < 0 ? null : entity.id,
          DisplayConfigurationId: sign.id,
          AgencyId: entity.agency ? entity.agency.externalProperties.MTC.AgencyId : null,
          RouteId: entity.route ? entity.route.route_id : null,
          StopId: entity.stop ? entity.stop.stop_id : null,
        }
      })
    }
    let saveDisplays = []
    sign.displays.map(display => {
      saveDisplays.push(saveDisplay(display))
    })
    console.log('saving', sign.id, json)
    const url = getSignConfigUrl() + (sign.id < 0 ? '' : '/' + sign.id)
    const method = sign.id < 0 ? 'post' : 'put'
    console.log('url/method', url, method)
    fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.token
      },
      body: JSON.stringify(json)
    }).then((res) => {
      console.log('status='+res.status)
      browserHistory.push('/signs')
      dispatch(fetchRtdSigns())
    })
  }
}
