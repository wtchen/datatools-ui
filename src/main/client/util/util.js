import { UserAuthWrapper } from 'redux-auth-wrapper'
import { routerActions, push } from 'react-router-redux';

// import { redirectUser } from '../actions/user'

import fetch from 'isomorphic-fetch'

export function defaultSorter(a, b) {
  if(a.isCreating && !b.isCreating) return -1
  if(!a.isCreating && b.isCreating) return 1
  if(a.name < b.name) return -1
  if(a.name > b.name) return 1
  return 0
}

export function retrievalMethodString(method) {
  switch (method) {
    case 'MANUALLY_UPLOADED': return 'Manually Uploaded'
    case 'FETCHED_AUTOMATICALLY': return 'Fetched Automatically'
    case 'PRODUCED_IN_HOUSE': return 'Produced In-house'
  }
}

export function secureFetch(url, state, method, payload) {
  var opts = {
    method: method || 'get',
    headers: {
      'Authorization': 'Bearer ' + state.user.token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
  if(payload) opts.body = JSON.stringify(payload)
  return fetch(url, opts)
}

export const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.user,
  predicate: user => user.profile !== null,
  redirectAction: push,
  failureRedirectPath: '/',
  wrapperDisplayName: 'UserIsAuthenticated'
})
