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
