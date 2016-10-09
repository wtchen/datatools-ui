import { secureFetch } from '../../common/util/util'

import { updateGtfsFilter } from '../../gtfs/actions/filter'
import { fetchRtdAlerts } from './alerts'
import { fetchProjectFeeds } from '../../manager/actions/feeds'
import { setActiveProject } from '../../manager/actions/projects'
import { getConfigProperty } from '../../common/util/config'

function requestProjects () {
  return {
    type: 'REQUEST_PROJECTS'
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
        if (getState().projects.active) {
          project = getState().projects.active
        } else {
          project = projects.find(proj => proj.id === getConfigProperty('application.active_project')) ||
            projects[0]
          dispatch(setActiveProject(project))
        }
        return dispatch(fetchProjectFeeds(project.id))
      })
      .then(() => {
        console.log('updating filter')
        dispatch(updateGtfsFilter(getState().projects.active, getState().user))
        return dispatch(fetchRtdAlerts())
      })
      .then(() => {
        return project
      })
  }
}
