import { browserHistory } from 'react-router'
import fetch from 'isomorphic-fetch'
import { getSignConfigUrl, getDisplaysUrl } from '../../common/util/modules'

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

      if (agency !== null) {
        newEntity.agency = agency
      }
      const typeKey = type.toLowerCase()
      newEntity[typeKey] = entity
      entities.push(newEntity)
    }

    const sign = {
      id: nextSignId,
      title: '', // 'New Configuration',
      affectedEntities: entities,
      published: false,
      displays: []
    }
    browserHistory.push('/signs/new')
    dispatch(updateActiveSign(sign))
  }
}

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
      return res.json()
    }).then(json => {
      console.log(json)
      let saveDisplays = []
      let newSignId = null
      if (sign.displays) {
        sign.displays.map(display => {
          display.DraftDisplayConfigurationId = newSignId
          saveDisplays.push(saveDisplay(display, user))
        })
      }
      return Promise.all(saveDisplays).then((results) => {
        // console.log(results)
        browserHistory.push('/signs')
        dispatch(fetchRtdSigns())
      })
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
    type: 'RECEIVED_SIGN_GTFS_ENTITIES',
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

export const receivedRtdDisplays = (rtdDisplays, activeProject) => {
  return {
    type: 'RECEIVED_RTD_DISPLAYS',
    rtdDisplays,
    activeProject
  }
}

export function setActiveSign (signId) {
  return function (dispatch, getState) {
    const sign = getState().signs.all.find(a => a.id === signId)
    dispatch(updateActiveSign(sign))
  }
}

export function fetchRtdDisplays () {
  return function (dispatch, getState) {
    return fetch(getDisplaysUrl()).then((res) => {
      return res.json()
    }).then((displays) => {
      // console.log(displays)
      dispatch(receivedRtdDisplays(displays, getState().projects.active))
    })
  }
}

export function fetchRtdSigns () {
  return function (dispatch, getState) {
    dispatch(requestRtdSigns())
    return fetch(getSignConfigUrl()).then((res) => {
      return res.json()
    }).then((signs) => {
      dispatch(receivedRtdSigns(signs, getState().projects.active))
      dispatch(fetchRtdDisplays())
    }).then(() => {
      let feed = getState().projects.active
      const fetchFunctions = getState().signs.entities.map((entity) => {
        return fetchEntity(entity, feed)
      })
      return Promise.all(fetchFunctions)
      .then((results) => {
        console.log('got entities', results)
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

export const updateActiveSign = (sign) => {
  return {
    type: 'UPDATE_ACTIVE_SIGN',
    sign
  }
}

export function editSign (sign) {
  return function (dispatch, getState) {
    dispatch(updateActiveSign(sign))
    browserHistory.push('/signs/sign/' + sign.id)
  }
}

export function fetchEntity (entity, activeProject) {
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

export const createDisplay = (name) => {
  return function (dispatch, getState) {
    console.log('creating display', name)
    let display = {
      Id: -1,
      DisplayTitle: name,
      PrimaryCptAgencyId: null,
      StopPublicId: null,
      PublishedDisplayConfigurationId: null,
      DraftDisplayConfigurationId: null,
      LocationDescription: "",
      DisplayLatitude: null,
      DisplayLongitude: null,
      ContactEmailList: null,
      DisplayStatus: "Inactive",
    }
    return saveDisplay(display, getState().user)
  }
}

export function saveDisplay (display, user) {
  // return function (dispatch, getState) {
    // const user = getState().user
    const url = display.Id < 0 ? getDisplaysUrl() : getDisplaysUrl() + '/' + display.Id
    console.log(url)
    const method = display.Id < 0 ? 'post' : 'put'
    return fetch(url, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + user.token
      },
      body: JSON.stringify(display)
    }).then((res) => {
      console.log('status='+res.status)
    })
  // }
}

export function saveSign (sign) {
  return function (dispatch, getState) {
    console.log('saving...')
    const user = getState().user
    let detailsArray = sign.affectedEntities.map((entity) => {
      console.log('ent', entity)
      return entity.route ? entity.route.map(r => {
        return {
          Id: entity.id < 0 ? null : entity.id,
          DisplayConfigurationId: sign.id,
          AgencyId: entity.agency ? entity.agency.externalProperties.MTC.AgencyId : null,
          RouteId: r ? r.route_id : null,
          StopId: entity.stop ? entity.stop.stop_id : null
        }
      }) : []
    })
    // flatten array
    let details = [].concat.apply([], detailsArray)
    var json = {
      Id: sign.id < 0 ? null : sign.id,
      ConfigurationDescription: sign.title || 'New Configuration',
      DraftDisplayConfigurationStatus: sign.published ? 'Published' : 'Unpublished',
      DisplayConfigurationDetails: details
    }
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
    }).then(res => {
      console.log('status='+res.status)
      return res.json()
    }).then(json => {
      console.log(json)
      let saveDisplays = []
      let newSignId = json.SequenceId ? json.SequenceId : sign.id
      if (sign.displays) {
        sign.displays.map(display => {
          if (display.DraftDisplayConfigurationId === sign.Id)
            display.DraftDisplayConfigurationId = newSignId
          if (display.PublishedDisplayConfigurationId === sign.Id)
            display.PublishedDisplayConfigurationId = newSignId
          console.log(display)
          saveDisplays.push(saveDisplay(display, user))
        })
      }
      return Promise.all(saveDisplays).then((results) => {
        // console.log(results)
        browserHistory.push('/signs')
        dispatch(fetchRtdSigns())
      })
    })
  }
}
