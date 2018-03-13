import auth0 from 'auth0-js'
import Auth0Lock from 'auth0-lock'
import decode from 'jwt-decode'
import moment from 'moment'
import uuidv4 from 'uuid/v4'

import { getConfigProperty, getComponentMessages, getMessage } from '../util/config'

const clientID = process.env.AUTH0_CLIENT_ID
const domain = process.env.AUTH0_DOMAIN
const auth0Client = new auth0.WebAuth({ domain, clientID })

class Auth0Manager {
  /**
   * Get an Auth0Lock instance.  If one isn't available, create it.
   * I put this here because this will get called after all the config is loaded.
   * The `this.lockOptions` variable is meant to be injected in a testing environment
   *
   * @return {Object} An auth0 lock instance
   */
  getLock () {
    if (!this.lock) {
      this.lock = new Auth0Lock(
        clientID,
        domain,
        // NOTE: The `this.lockOptions` variable is meant to be injected in a
        // testing environment.
        this.lockOptions || {
          allowSignUp: false,
          auth: {
            params: {
              scope: 'app_metadata openid email user_metadata'
            },
            redirect: false
          },
          autoclose: true,
          closable: true,
          languageDictionary: {
            title: getMessage(getComponentMessages('Login'), 'title')
          },
          theme: {
            logo: 'https://s3-eu-west-1.amazonaws.com/analyst-logos/conveyal-128x128.png',
            primaryColor: '#2389c9'
          }
        }
      )
    }

    return this.lock
  }

  getProfileFromToken (accessToken) {
    return new Promise((resolve, reject) => {
      this.getLock().getUserInfo(accessToken, (err, profile) => {
        if (err) reject(err)
        else resolve(profile)
      })
    })
  }

  /**
   * Retrieves the user token from localStorage.
   * @return {String} auth0 user token
   */
  getAccessToken () {
    return window.localStorage.getItem('userToken')
  }

  getIdToken () {
    return window.localStorage.getItem('idToken')
  }

  hideLock () {
    this.getLock().hide()
  }

  /**
   * Show the lock screenn and potentially do stuff after a successful login
   *
   * @param  {Function} [onHide=noop function]
   *   A function to perform if a user closes the lock without logging in
   * @param  {Function} [push]                  A dispatch-aware action function
   * @param  {Function} receiveTokenAndProfile  A dispatch-aware action function
   * @param  {Mixed} [redirectOnSuccess=false]
   *   The string of the route to redirect to upon login success
   */
  loginWithLock ({ onHide = () => {}, push, receiveTokenAndProfile, redirectOnSuccess = false }) {
    // Store location for location return after callback
    window.localStorage.setItem('randomStateValue', window.location.href)
    // FIXME: redirect to /login
    const lock = this.getLock()

    let hideFn = onHide

    function clearOnHideFn () {
      hideFn = () => {}
    }

    function registerOnHideFn () {
      hideFn = onHide
    }

    lock.on('hide', () => {
      hideFn()
    })

    lock.on('authenticated', (authResult) => {
      this.receiveAuthResult({
        authResult,
        push,
        receiveTokenAndProfile,
        redirectOnSuccess
      })
    })

    // register these listeners to make sure the onHide function is not called
    // after a successful login
    lock.on('signin submit', () => { clearOnHideFn() })
    lock.on('signup submit', () => { clearOnHideFn() })
    lock.on('authorization_error', (e) => { registerOnHideFn() })

    lock.show()
  }

  /**
   * Log a user out from this auth0 client
   * - remove token from localStorage
   * - make a call to auth0 to logout
   */
  logout () {
    this.removeToken()
    const port = window.location.port ? `:${window.location.port}` : ''
    const redirect = `${window.location.protocol}//${window.location.hostname}${port}`
    window.location.replace(`https://${domain}/v2/logout?returnTo=${redirect}&client_id=${clientID}`)
  }

  /**
   * Recive an authResult and dispatch appropriate actions
   *
   * @param  {Object} authResult                The authResult
   * @param  {Action} [push]                    react-router-redux push
   * @param  {Action} receiveTokenAndProfile
   * @param  {String} [redirectOnSuccess=false] A possible route to redirect to upon success
   * @return {Mixed}                            actions
   */
  receiveAuthResult ({
    authResult,
    push,
    receiveTokenAndProfile,
    redirectOnSuccess
  }) {
    if (!authResult) return receiveTokenAndProfile()

    this.setAccessToken(authResult.accessToken)
    this.setIdToken(authResult.idToken)

    return this.getProfileFromToken(authResult.accessToken)
      .then((profile) => {
        const actions = [
          receiveTokenAndProfile({
            token: authResult.idToken,
            profile
          })
        ]
        if (push) {
          if (redirectOnSuccess) {
            actions.push(push(redirectOnSuccess))
          } else if (window.location.pathname === '/') {
            actions.push(push('/home'))
          }
        }
        return actions
      })
      .catch((err) => {
        console.error('An error occurred while trying to get the user profile', err)
        this.removeToken()
        return receiveTokenAndProfile()
      })
  }

  removeToken () {
    window.localStorage.removeItem('userToken')
  }

  /**
   * Attempt to silently renew the session
   *
   * @return {Promise} if successful, returns an authResult
   */
  renewAuth () {
    return new Promise((resolve, reject) => {
      const nonce = uuidv4()
      auth0Client.renewAuth({
        audience: '',
        nonce,
        postMessageDataType: 'auth0:silent-authentication',
        redirectUri: window.location.origin + '/api/auth0-silent-callback',
        scope: 'openid email',
        usePostMessage: true
      }, (err, authResult) => {
        if (err) {
          console.log('Failed to renew log in.')
          reject(err)
        } else if (!authResult.accessToken) {
          const err = new Error('accessToken not received from auth0')
          console.log(authResult)
          reject(err)
        } else if (!nonceMathces(authResult.accessToken, nonce)) {
          const err = new Error('Nonce string does not match!')
          reject(err)
        } else {
          console.log('renewed auth successfully!')
          resolve(authResult)
        }
      })
    })
  }

  /**
   * Renew the user's session if needed.
   * If user token hasn't yet expired, use it.
   * If token has expired, try to silently renew it.
   * Logout user if session renewal fails.
   *
   * @param  {Function} receiveTokenAndProfile an action function
   * @param  {Function} logout                 an action function
   * @param  {Boolean} userIsLoggedIn
   * @return {Mixed}  Return is dependent on what actions need to happen
   */
  renewSessionIfNeeded ({
    logout,
    receiveTokenAndProfile,
    userIsLoggedIn
  }) {
    // Get the user token if we've saved it in localStorage before
    const userToken = this.getIdToken()

    if (userToken) {
      // user has logged in before
      // check if token is expired
      if (tokenIsExpired(userToken)) {
        // expired, try to refresh token
        if (this.isTryingToRenewExpiredToken) return []

        this.isTryingToRenewExpiredToken = true
        return (
          this.renewAuth()
            .then((authResult) => {
              this.isTryingToRenewExpiredToken = false
              return this.receiveAuthResult({
                authResult,
                receiveTokenAndProfile
              })
            })
            .catch((err) => {
              this.isTryingToRenewExpiredToken = false
              console.error('an error occurred while trying to log in', err)
              return logout(userIsLoggedIn)
            })
        )
      } else {
        // Token is still valid.
        // Check that enough time has passed to try again.
        const profileRefreshTime = getConfigProperty('application.profile_refresh_time')
        if (
          userIsLoggedIn &&
          (profileRefreshTime < 0 ||
            (profileRefreshTime >= 0 && this.profileExpirationTime.isAfter(moment())))
        ) {
          return []
        } else if (profileRefreshTime >= 0) {
          this.profileExpirationTime = moment().add(profileRefreshTime, 'seconds')
        }

        if (this.isTryingToGetProfileFromToken) return []

        this.isTryingToGetProfileFromToken = true

        const accessToken = this.getAccessToken()
        if (!accessToken) return logout(userIsLoggedIn)
        return this.getProfileFromToken(accessToken)
          .then((profile) => {
            this.isTryingToGetProfileFromToken = false
            return receiveTokenAndProfile({
              token: userToken,
              profile
            })
          })
          .catch((err) => {
            this.isTryingToGetProfileFromToken = false
            console.error('an error occurred while trying to get the token', err)
            return logout(userIsLoggedIn)
          })
      }
    } else {
      // user hasn't logged in before
      return logout(userIsLoggedIn)
    }
  }

  resetPassword () {
    this.getLock().show({
      allowLogin: false,
      allowSignUp: false
    })
  }

  setAccessToken (token) {
    window.localStorage.setItem('userToken', token)
  }

  setIdToken (token) {
    window.localStorage.setItem('idToken', token)
  }
}

function nonceMathces (token, nonce) {
  const decoded = decode(token)
  return decoded.nonce === nonce
}

/**
 * See if a token has expired
 * @param  {String}  token The auth0 token
 * @return {Boolean}       Returns true if token is expired
 */
function tokenIsExpired (token) {
  const decoded = decode(token)
  if (!decoded.exp) {
    // shouldn't happen, but assume it doesn't expire?
    return false
  }

  return (new Date()).getTime() > decoded.exp * 1000
}

const manager = new Auth0Manager()
export default manager
