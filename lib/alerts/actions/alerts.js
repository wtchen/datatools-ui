import { browserHistory } from 'react-router'
import {createAction} from 'redux-actions'

import { fetchStopsAndRoutes } from '../../gtfs/actions/general'
import { secureFetch } from '../../common/actions'
import { getAlertsUrl, getFeedId } from '../../common/util/modules'
import {getActiveProject} from '../../manager/selectors'

const updateActiveAlert = createAction('UPDATE_ACTIVE_ALERT_ALERT')

// alerts management action

let nextAlertId = 0
let nextStopEntityId = 100

export function createAlert (entity, agency) {
  return function (dispatch, getState) {
    nextAlertId--
    const entities = []

    if (entity) {
      nextStopEntityId++
      const type = typeof entity.stop_id !== 'undefined' ? 'STOP' : 'ROUTE'
      const newEntity = {
        id: nextStopEntityId,
        type: type
      }

      if (agency !== null) {
        newEntity.agency = agency
      }

      const typeKey = type.toLowerCase()
      newEntity[typeKey] = entity
      entities.push(newEntity)
    }

    const alert = {
      id: nextAlertId,
      title: '', // 'New Alert',
      affectedEntities: entities,
      published: false
    }
    dispatch(updateActiveAlert(alert))

    if (window.location.pathname !== '/alerts/new') {
      browserHistory.push('/alerts/new')
    }
  }
}

export function deleteAlert (alert) {
  return function (dispatch, getState) {
    return dispatch(secureFetch(`${getAlertsUrl()}/${alert.id}`, 'delete'))
      .then((res) => res.json())
      .then(json => {
        browserHistory.push('/alerts')
        dispatch(fetchRtdAlerts())
      })
      .catch(e => console.log(e))
  }
}

const requestRtdAlerts = createAction('REQUEST_RTD_ALERTS')
const receivedRtdAlerts = createAction('RECEIVED_RTD_ALERTS')

export function setActiveAlert (alertId) {
  return function (dispatch, getState) {
    const alert = getState().alerts.all.find(a => a.id === alertId)
    dispatch(updateActiveAlert(alert))
  }
}

export function fetchRtdAlerts () {
  return function (dispatch, getState) {
    dispatch(requestRtdAlerts())
    const project = getActiveProject(getState())
    return dispatch(secureFetch(getAlertsUrl()))
      .then(res => res.json())
      .then(rtdAlerts => dispatch(receivedRtdAlerts({rtdAlerts, project})))
      .then(() => dispatch(fetchStopsAndRoutes(getState().alerts.entities, 'ALERTS')))
  }
}

export function editAlert (alert) {
  return function (dispatch, getState) {
    dispatch(updateActiveAlert(alert))
    browserHistory.push(`/alert/${alert.id}`)
  }
}

export function saveAlert (alert) {
  return function (dispatch, getState) {
    const json = {
      Id: alert.id < 0 ? null : alert.id,
      HeaderText: alert.title || 'New Alert',
      DescriptionText: alert.description || '',
      Url: alert.url || '',
      Cause: alert.cause || 'UNKNOWN_CAUSE',
      Effect: alert.effect || 'UNKNOWN_EFFECT',
      Published: alert.published ? 'Yes' : 'No',
      StartDateTime: alert.start / 1000 || 0,
      EndDateTime: alert.end / 1000 || 0,
      ServiceAlertEntities: alert.affectedEntities.map((entity) => {
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
    const url = getAlertsUrl() + (alert.id < 0 ? '' : '/' + alert.id)
    const method = alert.id < 0 ? 'post' : 'put'
    console.log('url/method', url, method)
    return dispatch(secureFetch(url, method, json))
      .then((res) => res.json())
      .then(json => {
        // On successful save, re-route back to main alerts viewer
        browserHistory.push('/alerts')
        dispatch(fetchRtdAlerts())
      })
      .catch(e => console.log(e))
  }
}
