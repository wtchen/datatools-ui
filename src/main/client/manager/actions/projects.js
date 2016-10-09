import { secureFetch } from '../../common/util/util'
import { updateGtfsFilter } from '../../gtfs/actions/filter'
import { setErrorMessage, startJobMonitor } from './status'
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
      // .catch(err => console.log(err))
      .then(projects => {
        dispatch(receiveProjects(projects))
        return projects
      })
  }
}

export function fetchProjectsWithPublicFeeds () {
  return function (dispatch, getState) {
    dispatch(requestingProjects())
    const url = '/api/manager/public/project'
    return secureFetch(url, getState())
      .then(response => response.json())
      // .catch(err => console.log(err))
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

export function receiveProject (project) {
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
      // .catch(err => console.log(err))
      .then(project => {
        dispatch(receiveProject(project))
        return project
        // if (!unsecure)
        //   return dispatch(fetchProjectFeeds(project.id))
      })
  }
}

export function fetchProjectWithFeeds (projectId, unsecure) {
  return function (dispatch, getState) {
    dispatch(requestingProject())
    const apiRoot = unsecure ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/project/${projectId}`
    return secureFetch(url, getState())
      .then(response => response.json())
      // .catch(err => console.log(err))
      .then(project => {
        dispatch(receiveProject(project))
        if (!unsecure)
          return dispatch(fetchProjectFeeds(project.id))
      })
  }
}

function deletingProject () {
  return {
    type: 'DELETING_PROJECT',
  }
}

export function deletedProject (project) {
  return {
    type: 'DELETED_PROJECT',
    project
  }
}

export function deleteProject (project) {
  return function (dispatch, getState) {
    dispatch(deletingProject())
    const url = `/api/manager/secure/project/${project.id}`
    return secureFetch(url, getState(), 'delete')
      .then(response => response.json())
      // .catch(err => console.log(err))
      .then(project => {
        dispatch(deletedProject(project))
        return project
      })
  }
}

export function updateProject (project, changes, fetchFeeds = false) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = `/api/manager/secure/project/${project.id}`
    return secureFetch(url, getState(), 'put', changes)
      .then((res) => {
        if (fetchFeeds) {
          return dispatch(fetchProjectWithFeeds(project.id))
        } else {
          return dispatch(fetchProject(project.id))
        }
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
      // .catch(err => console.log(err))
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

export function receiveFetchFeedsForProject (project) {
  return {
    type: 'RECEIVE_FETCH_FEED_FOR_PROJECT',
    project
  }
}

export function fetchFeedsForProject (project) {
  return function (dispatch, getState) {

    dispatch(runningFetchFeedsForProject())
    const url = `/api/manager/secure/project/${project.id}/fetch`
    return secureFetch(url, getState(), 'post')
      .then(res => {
        if (res.status === 304) {
          // dispatch(feedNotModified(feedSource, 'Feed fetch cancelled because it matches latest feed version.'))
          console.log('fetch cancelled because matches latest')
        }
        else if (res.status >= 400) {
          dispatch(setErrorMessage('Error fetching project feeds'))
        }
        else {
          dispatch(receiveFetchFeedsForProject(project))
          dispatch(startJobMonitor())
          return res.json()
        }
      })
      .then(result => {
        console.log('fetchFeed result', result)
        dispatch(receiveFetchFeedsForProject())
        dispatch((fetchProjectWithFeeds(project.id)))
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

// Download a merged GTFS file for a Project

export function downloadFeedForProject (project) {
  return function (dispatch, getState) {
    const url = `/api/manager/public/project/${project.id}/download`
    window.location.assign(url)
    // return secureFetch(url, getState())
    // .then(response => {
    //   console.log(response.body)
    //   return response.body
    // })
    // .then(result => {
    //   // window.location.assign(`/api/manager/downloadfeed/${result.id}`)
    //   console.log(result)
    //   var zipName = 'download.zip';
    //   var a = document.createElement('a');
    //   a.href = "data:application/zip;base64," + result;
    //   a.download = zipName;
    //   a.click();
    // })
  }
}
