import { secureFetch } from '../../common/util/util'
import { updateGtfsFilter } from '../../gtfs/actions/gtfsFilter'
import { fetchProjectFeeds, updateFeedSource } from './feeds'
// Bulk Project Actions

function requestingProjects () {
  return {
    type: 'REQUESTING_PROJECTS',
  }
}

function receiveProjects (projects) {
  return {
    type: 'RECEIVE_PROJECTS',
    projects
  }
}

function settingActiveProject (project) {
  return {
    type: 'SET_ACTIVE_PROJECT',
    project
  }
}
export function setActiveProject (project) {
  return function (dispatch, getState) {
    dispatch(settingActiveProject(project))
    dispatch(fetchProjectFeeds(project.id))
    .then(() => {
      dispatch(updateGtfsFilter(getState().projects.active, getState().user))
    })
  }
}

export function fetchProjects () {
  return function (dispatch, getState) {
    dispatch(requestingProjects())
    return secureFetch('/api/manager/secure/project', getState())
      .then(response => response.json())
      .then(projects =>
        dispatch(receiveProjects(projects))
      )
  }
}

export function fetchProjectsWithPublicFeeds () {
  return function (dispatch, getState) {
    dispatch(requestingProjects())
    const url = '/api/manager/public/project'
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(projects => {
        dispatch(receiveProjects(projects))
      })
  }
}

// Single Project Actions

function requestingProject () {
  return {
    type: 'REQUESTING_PROJECT',
  }
}

function receiveProject (project) {
  return {
    type: 'RECEIVE_PROJECT',
    project
  }
}

export function fetchProject (projectId, unsecure) {
  return function (dispatch, getState) {
    dispatch(requestingProject())
    const apiRoot = unsecure ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/project/${projectId}`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(project => {
        dispatch(receiveProject(project))
        if (!unsecure)
          return dispatch(fetchProjectFeeds(project.id))
      })
  }
}

export function updateProject (project, changes) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = `/api/manager/secure/project/${project.id}`
    return secureFetch(url, getState(), 'put', changes)
      .then((res) => {
        return dispatch(fetchProject(project.id))
      })
  }
}

export function createProject () {
  return {
    type: 'CREATE_PROJECT'
  }
}

export function requestingSync () {
  return {
    type: 'REQUESTING_SYNC',
  }
}

export function receiveSync () {
  return {
    type: 'RECEIVE_SYNC',
  }
}

export function thirdPartySync (projectId, type) {
  return function (dispatch, getState) {
    dispatch(requestingSync())
    const url = '/api/manager/secure/project/' + projectId + '/thirdPartySync/' + type
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(project => {
        dispatch(receiveSync())
        return dispatch(fetchProject(projectId))
      })
  }
}

export function runningFetchFeedsForProject () {
  return {
    type: 'RUNNING_FETCH_FEED_FOR_PROJECT',
  }
}

export function receiveFetchFeedsForProject () {
  return {
    type: 'RECEIVE_FETCH_FEED_FOR_PROJECT',
  }
}

export function fetchFeedsForProject (project) {
  return function (dispatch, getState) {

    dispatch(runningFetchFeedsForProject())
    const url = `/api/manager/secure/project/${project.id}/fetch`
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(result => {
        console.log('fetchFeed result', result)
        dispatch(receiveFetchFeedsForProject())
        dispatch((fetchProject(project.id)))
      })
  }
}

function savingProject () {
  return {
    type: 'SAVING_PROJECT',
  }
}

export function saveProject (props) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = '/api/manager/secure/project'
    return secureFetch(url, getState(), 'post', props)
      .then((res) => {
        return dispatch(fetchProjects())
      })
  }
}
