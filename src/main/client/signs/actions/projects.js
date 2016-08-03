import { secureFetch } from '../../common/util/util'

import { updateGtfsFilter } from '../../gtfs/actions/gtfsFilter'
import { fetchRtdSigns } from './signs'
import { fetchProjectFeeds } from '../../manager/actions/feeds'
import { getConfigProperty } from '../../common/util/config'

function requestProjects () {
  return {
    type: 'REQUEST_PROJECTS',
  }
}

function receiveProjects (projects) {
  return {
    type: 'RECEIVE_PROJECTS',
    projects
  }
}

export function fetchProjects () {
  return function (dispatch, getState) {
    dispatch(requestProjects())
    let project
    return secureFetch('/api/manager/secure/project', getState())
      .then(response => response.json())
      .then((projects) => {
        console.log('received projects', projects)
        dispatch(receiveProjects(projects))
        project = getState().projects.active || projects.find(proj => proj.id === getConfigProperty('application.active_project'))
        return dispatch(fetchProjectFeeds(project.id))
      })
      .then(() => {
        console.log('updating filter')
        dispatch(updateGtfsFilter(getState().projects.active, getState().user))
        return dispatch(fetchRtdSigns())
      })
      .then(() => {
        return project
      })
  }
}
