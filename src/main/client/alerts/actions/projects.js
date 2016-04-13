import { secureFetch } from '../../common/util/util'
import { DataManager } from 'datatools-common'

import { updateGtfsFilter } from '../../gtfs/actions/gtfsFilter'
import { fetchRtdAlerts } from './alerts'
import { fetchProjectFeeds } from '../../manager/actions/feeds'

function requestProjects() {
  return {
    type: 'REQUEST_PROJECTS',
  }
}

function receiveProjects(projects) {
  return {
    type: 'RECEIVE_PROJECTS',
    projects
  }
}

export function fetchProjects() {
  return function (dispatch, getState) {
    dispatch(requestProjects())
    return secureFetch('/api/manager/secure/project', getState())
      .then(response => response.json())
      .then((projects) => {
        console.log('received projects', projects)
        dispatch(receiveProjects(projects))
        let project = projects.find(proj => proj.id === DT_CONFIG.modules.alerts.active_project)
        return dispatch(fetchProjectFeeds(project.id))
      })
      .then(() => {
        console.log('updating filter')
        dispatch(updateGtfsFilter(getState().projects.active, getState().user))
        return dispatch(fetchRtdAlerts())
      })
  }
}
