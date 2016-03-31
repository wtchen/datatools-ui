import fetch from 'isomorphic-fetch'

import { push } from 'react-router-redux'

function requestConfig() {
  return {
    type: 'REQUEST_CONFIG',
  }
}

function receiveConfig(config) {
  return {
    type: 'RECEIVE_CONFIG',
    config
  }
}

// Meet our first thunk action creator!
// Though its insides are different, you would use it just like any other action creator:
// store.dispatch(fetchPosts('reactjs'))

export function fetchConfig() {

  return function (dispatch) {

    dispatch(requestConfig())

    return fetch('/api/manager/config')
      .then(response => response.json())
      .then(config =>
        dispatch(receiveConfig(config))
      )
      .catch((err) => {
        console.error('error fetching config', err)
      })
  }
}

export function routerPush() {

  return function (dispatch, getState) {

    // dispatch(requestConfig())
    console.log('pushing')
    window.location.href = '/#/explore'
  }
}
