import fetch from 'isomorphic-fetch'

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
    console.log('get secure');
    return secureFetch('/api/manager/secure/project', getState())
      .then(response => response.json())
      .then(projects =>
        dispatch(receiveProjects(projects))
      )
  }
}

export function fetchProjectFeeds(projectId) {
  return function (dispatch, getState) {
  }
}

function savingProject() {
  return {
    type: 'SAVING_PROJECT',
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
  console.log("createProject");
  return {
    type: 'CREATE_PROJECT'
  }
}

export function saveProject(initialProps) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = '/api/manager/secure/project'
    return secureFetch(url, getState(), 'post', initialProps)
      .then((res) => {
        return dispatch(fetchProjects())
      })
  }
}

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
