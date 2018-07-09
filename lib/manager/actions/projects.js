import {createAction} from 'redux-actions'
import {browserHistory} from 'react-router'

import {secureFetch} from '../../common/actions'
import {getConfigProperty} from '../../common/util/config'
import {fetchProjectFeeds} from './feeds'
import {updateGtfsFilter} from '../../gtfs/actions/filter'
import {handleJobResponse} from './status'
import {getActiveProject} from '../selectors'
import {setVisibilitySearchText} from './visibilityFilter'

// Bulk Project Actions
const receiveProjects = createAction('RECEIVE_PROJECTS')
const requestingProjects = createAction('REQUESTING_PROJECTS')
// Single Project Actions
const requestingProject = createAction('REQUESTING_PROJECT')
const deletingProject = createAction('DELETING_PROJECT')
const requestingSync = createAction('REQUESTING_SYNC')
const receiveSync = createAction('RECEIVE_SYNC')
const savingProject = createAction('SAVING_PROJECT')
// Also used in deployments.js (actions)
export const receiveProject = createAction('RECEIVE_PROJECT')
const settingActiveProject = createAction('SET_ACTIVE_PROJECT')
const deletedProject = createAction('DELETED_PROJECT')
const runningFetchFeedsForProject = createAction('RUNNING_FETCH_FEED_FOR_PROJECT')
// Used by component
export const createProject = createAction('CREATE_PROJECT')

export function setActiveProject (project) {
  return function (dispatch, getState) {
    return dispatch(fetchProjectFeeds(project.id))
      .then(() => {
        dispatch(settingActiveProject(project))
        return dispatch(updateGtfsFilter(getActiveProject(getState()), getState().user))
      })
  }
}

export function fetchProjects (getActive = false) {
  return function (dispatch, getState) {
    dispatch(requestingProjects())
    return dispatch(secureFetch('/api/manager/secure/project'))
      .then(response => response.json())
      .then(projects => {
        dispatch(receiveProjects(projects))
        // return active project if requested
        if (getActive) {
          const activeProject = getActiveProject(getState())
          if (!activeProject.feedSources) {
            return dispatch(fetchProjectFeeds(activeProject.id))
              .then(() => {
                return dispatch(updateGtfsFilter(getActiveProject(getState()), getState().user))
                  .then(() => {
                    return activeProject
                  })
              })
          }
        }
        return projects
      })
  }
}

export function fetchProjectsWithPublicFeeds () {
  return function (dispatch, getState) {
    dispatch(requestingProjects())
    const url = '/api/manager/public/project'
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(projects => dispatch(receiveProjects(projects)))
  }
}

export function fetchProject (projectId, unsecure) {
  return function (dispatch, getState) {
    dispatch(requestingProject({projectId}))
    const apiRoot = unsecure ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/project/${projectId}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(project => {
        dispatch(receiveProject(project))
        return project
      })
  }
}

export function fetchProjectWithFeeds (projectId, unsecure) {
  return function (dispatch, getState) {
    dispatch(requestingProject({projectId}))
    const apiRoot = unsecure ? 'public' : 'secure'
    const url = `/api/manager/${apiRoot}/project/${projectId}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(project => {
        dispatch(receiveProject(project))
        if (!unsecure) {
          return dispatch(fetchProjectFeeds(project.id))
        }
      })
  }
}

export function deleteProject (project) {
  return function (dispatch, getState) {
    dispatch(deletingProject(project))
    const url = `/api/manager/secure/project/${project.id}`
    return dispatch(secureFetch(url, 'delete'))
      .then(response => response.json())
      .then(project => dispatch(deletedProject(project)))
      .then(() => browserHistory.push(`/home`))
  }
}

export function updateProject (project, changes, fetchFeeds = false) {
  return function (dispatch, getState) {
    dispatch(savingProject())
    const url = `/api/manager/secure/project/${project.id}`
    return dispatch(secureFetch(url, 'put', changes))
      .then((res) => {
        if (fetchFeeds) {
          return dispatch(fetchProjectWithFeeds(project.id))
        } else {
          return dispatch(fetchProject(project.id))
        }
      })
  }
}

export function deployPublic (project) {
  return function (dispatch, getState) {
    // dispatch(savingProject())
    const url = `/api/manager/secure/project/${project.id}/deployPublic`
    return dispatch(secureFetch(url, 'post'))
      .then((res) => res.json())
      .then(json => {
        return json
      })
  }
}

export function thirdPartySync (projectId, type) {
  return function (dispatch, getState) {
    dispatch(requestingSync(projectId))
    const url = `/api/manager/secure/project/${projectId}/thirdPartySync/${type}`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      // .catch(err => console.log(err))
      .then(project => {
        dispatch(receiveSync(projectId))
        return dispatch(fetchProjectWithFeeds(projectId))
      })
  }
}

export function fetchFeedsForProject (project) {
  return function (dispatch, getState) {
    dispatch(runningFetchFeedsForProject(project))
    const url = `/api/manager/secure/project/${project.id}/fetch`
    return dispatch(secureFetch(url, 'post'))
      .then(res => dispatch(handleJobResponse(res, 'Error fetching project feeds')))
  }
}

export function saveProject (props) {
  return function (dispatch, getState) {
    dispatch(savingProject(props))
    const url = '/api/manager/secure/project'
    return dispatch(secureFetch(url, 'post', props))
      .then((res) => res.json())
      .then((json) => dispatch(fetchProjects()))
  }
}

/**
 * Download a merged GTFS file for a Project
 */
export function downloadFeedForProject (project) {
  return function (dispatch, getState) {
    const url = `/api/manager/secure/project/${project.id}/download`
    // window.location.assign(url)
    return dispatch(secureFetch(url))
      .then(res => dispatch(handleJobResponse(res, 'Error merging project feeds')))
  }
}

/**
 * Download a GTFS file for a merged project feed.
 */
export function downloadMergedFeedViaToken (project, isPublic, prefix) {
  return function (dispatch, getState) {
    const route = isPublic ? 'public' : 'secure'
    const url = `/api/manager/${route}/project/${project.id}/downloadtoken`
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(json => {
        if (getConfigProperty('application.data.use_s3_storage')) {
          // Download object using presigned S3 URL.
          window.location.assign(json.url)
        } else {
          // use token to download feed
          window.location.assign(`/api/manager/downloadprojectfeed/${json.id}`)
        }
      })
  }
}

/**
 * When project viewer component mounts, unconditionally load project with feed
 * sources to ensure that updates to feed sources (e.g., a new feed version) are
 * applied to other project collections (e.g., a deployment that references said
 * feed source).
 */
export function onProjectViewerMount (initialProps) {
  return function (dispatch, getState) {
    const {projectId} = initialProps.router.params
    dispatch(setVisibilitySearchText(null))
    dispatch(fetchProjectWithFeeds(projectId))
  }
}
