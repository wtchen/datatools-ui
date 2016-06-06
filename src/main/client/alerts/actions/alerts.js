import { push } from 'react-router-redux'
import { browserHistory } from 'react-router'

import { secureFetch } from '../../common/util/util'
import { getAlertsUrl, getFeedId } from '../../common/util/modules'
import { setErrorMessage } from '../../manager/actions/status'
import moment from 'moment'

// alerts management action

let nextAlertId = 0
let nextStopEntityId = 100

export function createAlert (entity, agency) {
  return function (dispatch, getState) {
    nextAlertId--
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

    const alert = {
      id: nextAlertId,
      title: '', // 'New Alert',
      affectedEntities: entities,
      published: false,
      // start: moment().unix()*1000,
      // end: moment().add(30, 'day').unix()*1000
    }
    browserHistory.push('/alerts/new')
    dispatch(updateActiveAlert(alert))
  }
}

/*export const createAlert = (entity) => {
  nextAlertId--
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
    type: 'CREATE_ALERT',
    alert: {
      id: nextAlertId,
      title: 'New Alert',
      affectedEntities: entities,
      published: false
    }
  }
}*/

/*export const saveAlert = (alert) => {
  return {
    type: 'SAVE_ALERT',
    alert
  }
}*/

/*export const editAlert = (alert) => {
  return {
    type: 'EDIT_ALERT',
    alert
  }
}*/

export const deleteAlert = (alert) => {
  return function (dispatch, getState){
    console.log('deleting', alert)
    const user = getState().user
    const url = getAlertsUrl() + '/' + alert.id
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
      browserHistory.push('/alerts')
      dispatch(fetchRtdAlerts())
    })
  }
}

export const requestRtdAlerts = () => {
  return {
    type: 'REQUEST_RTD_ALERTS',
  }
}

export const receivedGtfsEntities = (gtfsObjects, gtfsAlerts) => {
  return {
    type: 'RECEIVED_ALERT_GTFS_ENTITIES',
    gtfsObjects,
    gtfsAlerts
  }
}


export const receivedRtdAlerts = (rtdAlerts, activeProject) => {
  return {
    type: 'RECEIVED_RTD_ALERTS',
    rtdAlerts,
    activeProject
  }
}

export function setActiveAlert (alertId) {
  return function (dispatch, getState) {
    const alert = getState().alerts.all.find(a => a.id === alertId)
    dispatch(updateActiveAlert(alert))
  }
}

export function fetchRtdAlerts () {
  return function (dispatch, getState) {
    dispatch(requestRtdAlerts())
    return secureFetch(getAlertsUrl(), getState()).then((res) => {
      if (res.status >= 400) {
        dispatch(setErrorMessage('Error fetching alerts!'))
        return []
      }
      return res.json()
    }).then((alerts) => {
      return dispatch(receivedRtdAlerts(alerts, getState().projects.active))
    }).then(() => {
      let feed = getState().projects.active
      const fetchFunctions = getState().alerts.entities.map((entity) => {
          return fetchEntity(entity, feed)
      })
      return Promise.all(fetchFunctions)
      .then((results) => {
        let newEntities = getState().alerts.entities
        for (var i = 0; i < newEntities.length; i++) {
          newEntities[i].gtfs = results[i]
        }
        dispatch(receivedGtfsEntities(newEntities, getState().alerts.all))
      }).then((error) => {
        console.log('error', error)
      })

    })
  }
}
// TODO: implement method for single alert fetch
// export const requestRtdAlert = () => {
//   return {
//     type: 'REQUEST_RTD_ALERT',
//   }
// }
//
// export const receivedRtdAlert = (rtdAlerts, activeProject) => {
//   return {
//     type: 'RECEIVED_RTD_ALERT',
//     rtdAlerts,
//     activeProject
//   }
// }
//
// export function fetchRtdAlert(alertId) {
//   return function (dispatch, getState) {
//     dispatch(requestRtdAlert())
//     return fetch(getAlertsUrl() + '/' + alertId).then((res) => {
//       return res.json()
//     }).then((alert) => {
//       const project = getState().projects.active
//       return dispatch(receivedRtdAlerts([alert], project))
//     }).then(() => {
//       let feed = getState().projects.active
//       const fetchFunctions = getState().alerts.entities.map((entity) => {
//           return fetchEntity(entity, feed)
//       })
//       return Promise.all(fetchFunctions)
//       .then((results) => {
//         let newEntities = getState().alerts.entities
//         for (var i = 0; i < newEntities.length; i++) {
//           newEntities[i].gtfs = results[i]
//         }
//         const alerts = getState().alerts.all
//         const alert = alerts.find(a => a.id === +alertId)
//         dispatch(receivedGtfsEntities(newEntities, alerts))
//         console.log('this alert', alert)
//         dispatch(updateActiveAlert(alert))
//       }).then((error) => {
//         console.log('error', error)
//       })
//
//     })
//   }
// }

export const updateActiveAlert = (alert) => {
  return {
    type: 'UPDATE_ACTIVE_ALERT_ALERT',
    alert
  }
}

export function editAlert(alert) {
  return function (dispatch, getState) {
    dispatch(updateActiveAlert(alert))
    browserHistory.push('/alerts/alert/'+alert.id)
  }
}

export function fetchEntity(entity, activeProject) {
  console.log()
  const feed = activeProject.feedSources.find(f => getFeedId(f) === entity.entity.AgencyId)
  const feedId = getFeedId(feed)
  const url = entity.type === 'stop' ? `/api/manager/stops/${entity.entity.StopId}?feed=${feedId}` : `/api/manager/routes/${entity.entity.RouteId}?feed=${feedId}`
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

export function saveAlert(alert) {
  return function (dispatch, getState) {
    console.log('saving...')
    const user = getState().user
    var json = {
      Id: alert.id < 0 ? null : alert.id,
      HeaderText: alert.title || 'New Alert',
      DescriptionText: alert.description || '',
      Url: alert.url || '',
      Cause: alert.cause || 'UNKNOWN_CAUSE',
      Effect: alert.effect || 'UNKNOWN_EFFECT',
      Published: alert.published ? 'Yes' : 'No',
      StartDateTime: alert.start/1000 || 0,
      EndDateTime: alert.end/1000 || 0,
      ServiceAlertEntities: alert.affectedEntities.map((entity) => {
        console.log('ent', entity)
        return {
          Id: entity.id,
          AlertId: alert.id,
          AgencyId: entity.agency ? getFeedId(entity.agency) : null,
          RouteId: entity.route ? entity.route.route_id : null,
          RouteShortName: entity.route ? entity.route.route_short_name : null,
          RouteType: entity.mode ? entity.mode.gtfsType : null,
          StopId: entity.stop ? entity.stop.stop_id : null,
          StopCode: entity.stop ? entity.stop.stop_code : null,
          TripId: null,
          ServiceAlertTrips: []
        }
      })
    }

    console.log('saving', alert.id, json)
    const url = getAlertsUrl() + (alert.id < 0 ? '' : '/' + alert.id)
    const method = alert.id < 0 ? 'post' : 'put'
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
      browserHistory.push('/alerts')
      dispatch(fetchRtdAlerts())
    })
  }
}
