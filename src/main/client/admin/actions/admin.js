import { secureFetch } from '../../common/util/util.js'

export function requestingUsers () {
  return {
    type: 'REQUESTING_USERS'
  }
}

export function receiveUsers (users) {
  return {
    type: 'RECEIVE_USERS',
    users
  }
}

export function fetchUsers () {
  return function (dispatch, getState) {
    dispatch(requestingUsers())
    const url = '/api/manager/secure/user'
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(data => {
        const users = JSON.parse(data)
        return dispatch(receiveUsers(users))
      })
      // .catch( err => {
      //   console.log(err)
      // })
  }
}

export function creatingUser () {
  return {
    type: 'CREATING_USER'
  }
}

export function createdUser (profile) {
  return {
    type: 'CREATED_USER',
    profile
  }
}

// server call
export function createUser (credentials) {
  return function (dispatch, getState) {
    dispatch(creatingUser())
    console.log(credentials)
    const url = '/api/manager/secure/user'
    return secureFetch(url, getState(), 'post', credentials)
      .then(response => response.json())
      .then(profile => {
        return dispatch(createdUser(JSON.parse(profile)))
      })
  }
}

export function deletingUser (user) {
  return {
    type: 'DELETING_USER',
    user
  }
}

export function deletedUser (user) {
  return {
    type: 'DELETED_USER',
    user
  }
}

// server call
export function deleteUser (user) {
  return function (dispatch, getState) {
    dispatch(deletingUser(user))
    const url = `/api/manager/secure/user/${user.user_id}`
    return secureFetch(url, getState(), 'delete')
      .then(response => response.json())
      .then(result => {
        return result
        dispatch(deletedUser(user))
      })
  }
}
