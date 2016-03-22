import fetch from 'isomorphic-fetch'

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

export function updateProject(project, changes) {
  return function (dispatch, getState) {
    console.log('updateProject', project.id, changes)
    fetch('/api/manager/project/'+project.id, {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changes)
    }).then((res) => {
      console.log('status='+res.status)
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
    console.log('saveProject', initialProps)
    fetch('/api/manager/project', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(initialProps)
    }).then((res) => {
      console.log('status='+res.status)
      return dispatch(fetchProjects())
    })
  }
}
