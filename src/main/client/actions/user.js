import { fetchProjects } from './projects'

import { secureFetch } from '../util/util'

export const checkingExistingLogin = () => {
  return {
    type: 'CHECKING_EXISTING_LOGIN'
  }
}

export const noExistingLogin = () => {
  return {
    type: 'NO_EXISTING_LOGIN'
  }
}

export const userLoggedIn = (token, profile) => {
  return {
    type: 'USER_LOGGED_IN',
    token,
    profile
  }
}

export function checkExistingLogin() {
  return function (dispatch, getState) {
    dispatch(checkingExistingLogin())
    console.log('checkExistingLogin');
    var login = getState().user.auth0.checkExistingLogin()
    if(login) {
      login.then((userTokenAndProfile) => {
        console.log(userTokenAndProfile)
        return dispatch(userLoggedIn(userTokenAndProfile.token, userTokenAndProfile.profile))
      })
      // .then(() => {
      // })
    } else {
      console.log('no login found');
      dispatch(noExistingLogin())
    }
  }
}

// server call
export function getUser (user) {
  return function (dispatch, getState) {
    const url = '/api/manager/secure/user/' + user
    return secureFetch(url, getState())
      .then(response => response.json())
      .then(user => {
        // console.log(user)
        return JSON.parse(user)
      })
  }
}

// server call
export function updateUser (user, permissions) {
  return function (dispatch, getState) {
    var payload = {
      user_id: user,
      data: permissions
    }
    const url = '/api/manager/secure/user/' + user
    return secureFetch(url, getState(), 'put', payload)
      .then(response => response.json())
      .then(user => {
        // console.log(user)
        return JSON.parse(user)
      })
  }
}

// server call
export function createUser (user) {
  return function (dispatch, getState) {
    const url = '/api/manager/public/user'
    return secureFetch(url, getState(), 'post', user)
      .then(response => response.json())
      .then(user => {
        // console.log(JSON.parse(user))
        return JSON.parse(user)
      })
  }
}

export function login (credentials, user) {
  return function (dispatch, getState) {
    if (!credentials){
      getState().user.auth0.loginViaLock().then((userInfo) => {
        return dispatch(userLoggedIn(userInfo.token, userInfo.profile))
      }).then(() => {
        dispatch(fetchProjects())
      })
    }
    else {
      credentials.client_id = getState().config.auth0ClientId
      credentials.connection = 'Username-Password-Authentication'
      credentials.username = credentials.email
      credentials.grant_type = 'password'
      credentials.scope = 'openid'
      const url = 'https://conveyal.eu.auth0.com/oauth/ro'
      return secureFetch(url, getState(), 'post', credentials)
      .then(response => response.json())
      .then(token => {
        // save token to localStorage
        localStorage.setItem('userToken', token.id_token)

        return getState().user.auth0.loginFromToken (token.id_token)
      }).then((userInfo) => {
        console.log('got user info', userInfo)
        return dispatch(userLoggedIn(userInfo.token, userInfo.profile))
      })
    }
  }
}

export function userLogout () {
  return {
    type: 'USER_LOGGED_OUT'
  }
}

export function logout () {
  return function (dispatch, getState) {
    dispatch(userLogout())
    getState().user.auth0.logout()
  }
}

export function resetPassword() {
  return function (dispatch, getState) {
    getState().user.auth0.resetPassword()
  }
}
