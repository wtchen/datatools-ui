import { secureFetch } from '../util/util'

import { fetchProjectFeeds } from './feeds'
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
        return dispatch(fetchProjects())
      })
  }
}

export function createProject() {
  return {
    type: 'CREATE_PROJECT'
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
