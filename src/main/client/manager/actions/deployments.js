import { secureFetch } from '../../common/util/util'
import { fetchProject } from './projects'
import { setErrorMessage } from './status'

// Deployment Actions

export function requestingDeployments () {
  return {
    type: 'REQUESTING_DEPLOYMENTS'
  }
}

export function receiveDeployments (projectId, deployments) {
  return {
    type: 'RECEIVE_DEPLOYMENTS',
    projectId,
    deployments
  }
}

export function fetchProjectDeployments (projectId) {
  return function (dispatch, getState) {
    dispatch(requestingDeployments())
    const url = '/api/manager/secure/deployments?projectId=' + projectId
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(deployments => {
        dispatch(receiveDeployments(projectId, deployments))
      })
  }
}

export function deployingToTarget (deployment, target) {
  return {
    type: 'DEPLOYING_TO_TARGET',
    deployment,
    target
  }
}

export function deployedToTarget (deployment, target) {
  return {
    type: 'DEPLOYED_TO_TARGET',
    deployment,
    target
  }
}

export function deployToTarget (deployment, target) {
  return function (dispatch, getState) {
    dispatch(deployingToTarget(deployment, target))
    const url = `/api/manager/secure/deployments/${deployment.id}/deploy/${target}`
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(() => {
        dispatch(deployedToTarget(deployment, target))
      })
  }
}


export function requestingDeployment () {
  return {
    type: 'REQUESTING_DEPLOYMENT'
  }
}

export function receiveDeployment (projectId, deployment) {
  return {
    type: 'RECEIVE_DEPLOYMENT',
    projectId,
    deployment
  }
}

export function requestingDeploymentStatus () {
  return {
    type: 'REQUESTING_DEPLOYMENT_STATUS'
  }
}

export function receiveDeploymentStatus (deployment, status) {
  return {
    type: 'RECEIVE_DEPLOYMENT_STATUS',
    deployment,
    status
  }
}

export function fetchDeploymentStatus (deployment, target) {
  return function (dispatch, getState) {
    dispatch(requestingDeploymentStatus())
    const url = `/api/manager/secure/deployments/status/${deployment.id}?target=${target}`
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(status => {
        console.log(status)
        dispatch(receiveDeploymentStatus(deployment, status))
      })
  }
}

export function fetchDeployment (id) {
  return function (dispatch, getState) {
    dispatch(requestingDeployment())
    const url = '/api/manager/secure/deployments/' + id
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(deployment => {
        dispatch(receiveDeployment(deployment.project.id, deployment))
      })
  }
}

export function fetchDeploymentAndProject (id) {
  return function (dispatch, getState) {
    dispatch(requestingDeployment())
    const url = '/api/manager/secure/deployments/' + id
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(deployment => {
        dispatch(fetchProject(deployment.project.id))
          .then(proj => {
            return dispatch(receiveDeployment(deployment.project.id, deployment))
          })
      })
  }
}

export function fetchDeploymentTargets () {
  return function (dispatch, getState) {
    dispatch(requestingDeploymentTargets())
    const url = '/api/manager/secure/deployments/targets'
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(targets => {
        return dispatch(receiveDeploymentTargets(targets))
      })
  }
}

export function createDeployment (projectId) {
  return {
    type: 'CREATE_DEPLOYMENT',
    projectId,
  }
}

export function createdDeployment (deployment) {
  return {
    type: 'CREATED_DEPLOYMENT',
    deployment
  }
}

export function deletingDeployment (feedSource) {
  return {
    type: 'DELETING_DEPLOYMENT',
    feedSource
  }
}

export function deleteDeployment (deployment) {
  return function (dispatch, getState) {
    dispatch(deletingDeployment(deployment))
    if (deployment.isCreating) {
      return dispatch(fetchProjectDeployments(deployment.project.id))
    }
    const url = '/api/manager/secure/deployments/' + deployment.id
    return secureFetch(url, getState(), 'delete')
      .then((res) => {
        return dispatch(fetchProjectDeployments(deployment.project.id))
      })
  }
}

export function savingDeployment () {
  return {
    type: 'SAVING_DEPLOYMENT'
  }
}
export function saveDeployment (props) {
  return function (dispatch, getState) {
    dispatch(savingDeployment())
    const url = '/api/manager/secure/deployments'
    return secureFetch(url, getState(), 'post', props)
      .then(response => response.json())
      .then(deployment => {
        console.log('created deployment', deployment)
        dispatch(fetchProjectDeployments(deployment.project.id))
      })
  }
}

export function createDeploymentFromFeedSource (feedSource) {
  return function (dispatch, getState) {
    dispatch(savingDeployment())
    const url = '/api/manager/secure/deployments/fromfeedsource/' + feedSource.id
    return secureFetch(url, getState(), 'post')
      .then(response => response.json())
      .then(deployment => {
        console.log('created deployment', deployment)
        return deployment
      })
  }
}

export function updateDeployment (deployment, changes) {
  return function (dispatch, getState) {
    dispatch(savingDeployment())
    const url = '/api/manager/secure/deployments/' + deployment.id
    return secureFetch(url, getState(), 'put', changes)
      .then(response => response.json())
      .then(deployment => {
        dispatch(fetchDeployment(deployment.id))
      })
  }
}
