import { secureFetch } from '../../common/util/util'
import { fetchFeedVersion } from './feeds'
import { fetchSnapshots } from '../../editor/actions/snapshots'

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

/*function watchingStatus (job) {
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
}*/

export function removeRetiredJob (job) {
  return {
    type: 'REMOVE_RETIRED_JOB',
    job
  }
}

export function receiveJobs (jobs) {
  return {
    type: 'RECEIVE_JOBS',
    jobs
  }
}

export function checkJobStatus () {
  return function (dispatch, getState) {
    return secureFetch(`/api/manager/secure/status/jobs`, getState())
      .then(response => response.json())
      .then(jobs => {
        // check for any just-finished jobs
        const previousJobs = getState().status.jobMonitor.jobs
        previousJobs.filter(j1 => jobs.findIndex(j2 => j1.jobId === j2.jobId) === -1).map(job => {
          dispatch(handleFinishedJob(job))
        })

        // if all jobs have finished, stop the timer
        if (previousJobs.length > 0 && jobs.length === 0) {
          dispatch(stopJobMonitor())
        }

        dispatch(receiveJobs(jobs))
      })
  }
}

export function setJobMonitorTimer (timer) {
  return {
    type: 'SET_JOBMONITOR_TIMER',
    timer
  }
}

function stopCurrentTimer (state) {
  const timer = state.status.jobMonitor.timer
  if (timer) clearInterval(timer)
}

export function startJobMonitor () {
  return function (dispatch, getState) {
    stopCurrentTimer(getState())

    const timerFunction = () => {
      dispatch(checkJobStatus())
    }

    timerFunction() // make an initial call right now
    const timer = setInterval(timerFunction, 2000)

    dispatch(setJobMonitorTimer(timer))
  }
}

export function stopJobMonitor () {
  return function (dispatch, getState) {
    stopCurrentTimer(getState())
    dispatch(setJobMonitorTimer(null))
  }
}

export function setJobMonitorVisible (visible) {
  return {
    type: 'SET_JOBMONITOR_VISIBLE',
    visible
  }
}

export function handleFinishedJob (job) {
  return function (dispatch, getState) {
    switch (job.type) {
      case 'VALIDATE_FEED':
        dispatch(fetchFeedVersion(job.feedVersionId))
        break
      case 'PROCESS_SNAPSHOT':
        dispatch(fetchSnapshots(job.feedVersion.feedSource))
        break
    }
  }
}
