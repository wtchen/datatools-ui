// @flow

import {Component} from 'react'

import * as userActions from '../../manager/actions/user'
import auth0 from '../user/Auth0Manager'

type Props = {
  onHide?: () => any,
  push: string => void,
  receiveTokenAndProfile: typeof userActions.receiveTokenAndProfile,
  redirectOnSuccess?: string
}

export default class Auth0 extends Component<Props> {
  componentDidMount () {
    // Show lock when component mounts. NOTE: render method returns null.
    auth0.loginWithLock(this.props)
  }

  componentWillUnmount () {
    // Hide lock when component unmounts
    auth0.hideLock()
  }

  render () {
    return null
  }
}
