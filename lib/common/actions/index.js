import fetch from 'isomorphic-fetch'
import {GTFS_GRAPHQL_PREFIX} from '../../common/constants'
import { setErrorMessage } from '../../manager/actions/status'

export function secureFetch (url, method = 'get', payload, raw = false, isJSON = true) {
  return function (dispatch, getState) {
    const {user} = getState()
    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Accept': 'application/json'
    }
    if (isJSON) {
      headers['Content-Type'] = 'application/json'
    }
    const body = payload && isJSON
      ? JSON.stringify(payload)
      : payload
    return fetch(url, {method, headers, body})
      // Catch basic error during fetch
      .catch(err => dispatch(setErrorMessage({message: `Error making request: (${err})`})))
      .then(res => {
        // if raw response is requested
        if (raw) return res
        let action, message
        // check for errors
        const {status} = res
        if (status >= 500) {
          action = 'RELOAD'
          message = `Network error!\n\n(${method} request on ${url})`
          dispatch(setErrorMessage({message, action}))
          return null
        } else if (status >= 400) {
          action = status === 401 ? 'LOG_IN' : null
          res.json().then(json => {
            const {detail, message} = json
            const unknown = `Unknown (${status}) error occurred while making request`
            dispatch(setErrorMessage({
              message: message || JSON.stringify(json) || unknown,
              action,
              detail
            }))
          })
          return null
        } else {
          return res
        }
      })
  }
}

export function fetchGraphQL ({query, variables}) {
  return function (dispatch, getState) {
    const body = {
      query,
      variables: JSON.stringify(variables)
    }
    return dispatch(secureFetch(GTFS_GRAPHQL_PREFIX, 'post', body))
  }
}
