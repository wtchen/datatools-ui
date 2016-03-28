import { secureFetch } from '../util/util'

import { fetchProjectFeeds, updateFeedSource } from './feeds'
// Bulk Project Actions

function requestingProjects() {
  return {
    type: 'REQUESTING_PROJECTS',
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
    dispatch(requestingProjects())
    return secureFetch('/api/manager/secure/project', getState())
      .then(response => response.json())
      .then(projects =>
        dispatch(receiveProjects(projects))
      )
  }
}

// Single Project Actions

function requestingProject() {
  return {
    type: 'REQUESTING_PROJECT',
  }
}

function receiveProject(project) {
  return {
    type: 'RECEIVE_PROJECT',
    project
  }
}

export function fetchProject(projectId) {
  return function (dispatch, getState) {
    dispatch(requestingProject())
    const url = '/api/manager/secure/project/' + projectId
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(project => {
        dispatch(receiveProject(project))
        return dispatch(fetchProjectFeeds(project.id))
      })
  }
}

export function updateProject(project, changes) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = '/api/manager/secure/project/' + project.id
    return secureFetch(url, getState(), 'put', changes)
      .then((res) => {
        return dispatch(fetchProject(project.id))
      })
  }
}

export function createProject() {
  return {
    type: 'CREATE_PROJECT'
  }
}

export function requestingSync(projectId, type) {
  return {
    type: 'REQUESTING_SYNC',
    projectId,
    type
  }
}

export function receiveSync(projectId, type) {
  return {
    type: 'RECEIVE_SYNC',
    projectId,
    type
  }
}

export function thirdPartySync(projectId, type) {
  return function (dispatch, getState) {
    dispatch(requestingSync(projectId, type))
    const url = '/api/manager/secure/project/' + projectId + '/thirdPartySync/' + type 
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(project => {
        dispatch(receiveSync(projectId, type))
        dispatch(fetchProject(projectId))
      })
  }
}

export function runningFetchFeedsForProject(project) {
  return {
    type: 'RUNNING_FETCH_FEED_FOR_PROJECT',
    project
  }
}

export function fetchFeedsForProject(project) {
  return function (dispatch, getState) {
    
    dispatch(runningFetchFeedsForProject(project.id))
    const url = `/api/manager/secure/project/${project.id}/fetch`
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(result => {
        console.log('fetchFeed result', result)
        // dispatch(fetchFeedVersions(feedSource))
      })
  }
}

function savingProject() {
  return {
    type: 'SAVING_PROJECT',
  }
}

export function saveProject(props) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = '/api/manager/secure/project'
    return secureFetch(url, getState(), 'post', props)
      .then((res) => {
        return dispatch(fetchProjects())
      })
  }
}
