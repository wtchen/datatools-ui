// @flow

import { secureFetch } from '../../common/actions'
import { setErrorMessage } from '../../manager/actions/status'

import type {dispatchFn, getStateFn, UserProfile} from '../../types'

export function requestingUsers () {
  return {
    type: 'REQUESTING_USERS'
  }
}

export function receiveUsers (users: Array<UserProfile>, totalUserCount: number) {
  return {
    type: 'RECEIVE_USERS',
    users,
    totalUserCount
  }
}

export function fetchUsers () {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(requestingUsers())
    const queryString = getState().admin.users.userQueryString

    let countUrl = '/api/manager/secure/usercount'
    if (queryString) countUrl += `?queryString=${queryString}`
    const getCount = dispatch(secureFetch(countUrl))
      .then(response => response.json())

    let usersUrl = `/api/manager/secure/user?page=${getState().admin.users.page}`
    if (queryString) usersUrl += `&queryString=${queryString}`
    const getUsers = dispatch(secureFetch(usersUrl))
      .then(response => response.json())

    Promise.all([getCount, getUsers]).then((results) => {
      if (Array.isArray(results[1])) {
        return dispatch(receiveUsers(results[1], results[0]))
      } else if (results[1].message) {
        return dispatch(setErrorMessage(results[1].message))
      } else {
        return dispatch(setErrorMessage('Received unexpected response'))
      }
    })
  }
}

export function fetchUserCount () {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(requestingUsers())
    const url = '/api/manager/secure/user/count'
    return dispatch(secureFetch(url))
      .then(response => response.json())
      .then(data => {
        console.log(data)
        // const users = JSON.parse(data)
        // return dispatch(receiveUsers(users))
      })
  }
}

export function creatingUser () {
  return {
    type: 'CREATING_USER'
  }
}

export function createdUser (profile: UserProfile) {
  return {
    type: 'CREATED_USER',
    profile
  }
}

// server call
export function createUser (credentials: any) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(creatingUser())
    const url = '/api/manager/secure/user'
    return dispatch(secureFetch(url, 'post', credentials))
      .then(response => response.json())
      .then(profile => {
        dispatch(createdUser(profile))
        return dispatch(fetchUsers())
      })
  }
}

export function deletingUser (user: UserProfile) {
  return {
    type: 'DELETING_USER',
    user
  }
}

export function deletedUser (user: UserProfile) {
  return {
    type: 'DELETED_USER',
    user
  }
}

// server call
export function deleteUser (profile: UserProfile) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    dispatch(deletingUser(profile))
    const url = `/api/manager/secure/user/${profile.user_id}`
    return dispatch(secureFetch(url, 'delete'))
      .then(response => response.json())
      .then(result => {
        dispatch(deletedUser(profile))
        return dispatch(fetchUsers())
      })
  }
}

export function setUserPage (page: number) {
  return {
    type: 'SET_USER_PAGE',
    page
  }
}

export function setUserQueryString (queryString: string) {
  return {
    type: 'SET_USER_QUERY_STRING',
    queryString
  }
}
