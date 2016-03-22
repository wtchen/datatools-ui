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
    return fetch('/api/manager/project')
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
    fetch('/api/manager/project/'+project.id, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changes)
    }).then((res) => {
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
    fetch('/api/manager/project', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialProps)
    }).then((res) => {
      return dispatch(fetchProjects())
    })
  }
}
