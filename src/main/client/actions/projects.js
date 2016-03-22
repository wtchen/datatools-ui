import fetch from 'isomorphic-fetch'

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

// Feed Source Actions

export function requestingFeedSources() {
  return {
    type: 'REQUESTING_FEEDSOURCES'
  }
}

export function receiveFeedSources(projectId, feedSources) {
  return {
    type: 'RECEIVE_FEEDSOURCES',
    projectId,
    feedSources
  }
}

export function fetchProjectFeeds(projectId) {
  return function (dispatch, getState) {
    dispatch(requestingFeedSources())
    const url = '/api/manager/secure/feedsource?projectId=' + projectId
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(feedSources => {
        dispatch(receiveFeedSources(projectId, feedSources))
      })
  }
}

export function createFeedSource(projectId) {
  return {
    type: 'CREATE_FEEDSOURCE',
    projectId
  }
}


export function savingFeedSource() {
  return {
    type: 'SAVING_FEEDSOURCE'
  }
}

export function saveFeedSource(props) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource())
    const url = '/api/manager/secure/feedsource'
    return secureFetch(url, getState(), 'post', props)
      .then((res) => {
        return dispatch(fetchProject(props.projectId))
      })
  }
}

export function updateFeedSource(feedSource, changes) {
  return function (dispatch, getState) {
    dispatch(savingFeedSource())
    const url = '/api/manager/secure/feedsource/' + feedSource.id
    return secureFetch(url, getState(), 'put', changes)
      .then((res) => {
        return dispatch(fetchProjectFeeds(feedSource.projectId))
      })
  }
}

// Utilties

function secureFetch(url, state, method, payload) {
  var opts = {
    method: method || 'get',
    headers: {
      'Authorization': 'Bearer: ' + state.user.token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  if(payload) opts.body = JSON.stringify(payload)
  return fetch(url, opts)
}
