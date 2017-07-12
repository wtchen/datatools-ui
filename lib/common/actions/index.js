import fetch from 'isomorphic-fetch'
import { setErrorMessage } from '../../manager/actions/status'

export function secureFetch (url, method = 'get', payload, raw) {
  return function (dispatch, getState) {
    const {user} = getState()
    var opts = {
      method: method,
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    if (payload) opts.body = JSON.stringify(payload)
    return fetch(url, opts)
      .catch(err => {
        dispatch(setErrorMessage(`Error making request: (${err})`))
      })
      .then(res => {
        // if raw response is requested
        if (raw) return res

        // check for errors
        if (!res || res.status >= 500) {
          dispatch(setErrorMessage(`Network error!\n\n(${method} request on ${url})`))
          return null
        } else if (res.status >= 400) {
          // res.text().then(text => {
          //   dispatch(setErrorMessage(text))
          // })
          res.json().then(json => {
            const message = json.message || `Unknown (${res.status}) error occurred while making request`
            dispatch(setErrorMessage(message))
          })
          return null
        } else {
          return res
        }
      })
  }
}
