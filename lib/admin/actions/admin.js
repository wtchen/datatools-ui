// @flow

import {createAction, type ActionType} from 'redux-actions'

import { secureFetch } from '../../common/actions'
import { setErrorMessage } from '../../manager/actions/status'

import type {UserProfile} from '../../types'
import type {dispatchFn, getStateFn} from '../../types/reducers'

export const createdUser = createAction(
  'CREATED_USER',
  (payload: UserProfile) => payload
)
export const receiveUsers = createAction(
  'RECEIVE_USERS',
  (payload: {
    totalUserCount: number,
    users: Array<UserProfile>
  }) => payload
)
export const requestingUsers = createAction('REQUESTING_USERS')
export const setUserPage = createAction(
  'SET_USER_PAGE',
  (payload: number /* page */) => payload
)
export const setUserQueryString = createAction(
  'SET_USER_QUERY_STRING',
  (payload: string /* queryString */) => payload
)

export type AdminActions = ActionType<typeof createdUser> |
  ActionType<typeof receiveUsers> |
  ActionType<typeof requestingUsers> |
  ActionType<typeof setUserPage> |
  ActionType<typeof setUserQueryString>

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
        return dispatch(receiveUsers({
          totalUserCount: results[0],
          users: results[1]
        }))
      } else if (results[1].message) {
        return dispatch(setErrorMessage({
          message: results[1].message
        }))
      } else {
        return dispatch(setErrorMessage({
          message: 'Received unexpected response'
        }))
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

// server call
export function createUser (credentials: any) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const url = '/api/manager/secure/user'
    return dispatch(secureFetch(url, 'post', credentials))
      .then(response => response.json())
      .then(profile => {
        dispatch(createdUser(profile))
        return dispatch(fetchUsers())
      })
  }
}

// server call
export function deleteUser (profile: UserProfile) {
  return function (dispatch: dispatchFn, getState: getStateFn) {
    const url = `/api/manager/secure/user/${profile.user_id}`
    return dispatch(secureFetch(url, 'delete'))
      .then(response => response.json())
      .then(result => {
        return dispatch(fetchUsers())
      })
  }
}
