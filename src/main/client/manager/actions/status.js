import { secureFetch } from '../../common/util/util'

export function setErrorMessage (message) {
  return {
    type: 'SET_ERROR_MESSAGE',
    message
  }
}

export function clearStatusModal () {
  return {
    type: 'CLEAR_STATUS_MODAL'
  }
}

function watchingStatus (job) {
  return {
    type: 'WATCHING_STATUS',
    job
  }
}

export function watchStatus (job) {
  return function (dispatch, getState) {
    dispatch(watchingStatus(project))

    // Check every 3 seconds if status is still there.
    // If so, then dispatch a `WATCHING_STATUS`, otherwise stop
    // the status watch.
    const intervalId = setInterval(() => {
      const active = getState().status.popover.active;

      if (active) {
        return secureFetch(`/api/manager/secure/${job}/status`, getState())
          .then(response => response.json())
          .then(status =>
            dispatch(receiveProjects(projects))
          )
      } else {
        clearInterval(intervalId);
      }
    }, 1000);
  }
}
