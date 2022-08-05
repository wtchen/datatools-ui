// @flow

import { Component } from 'react'
import { browserHistory } from 'react-router'

import type { Props as ContainerProps } from '../containers/Login'

type Props = ContainerProps & {
  loggedIn: boolean
}

export default class Login extends Component<Props> {
  componentDidMount () {
    const { auth0, loggedIn, query, redirectOnSuccess } = this.props
    if (!query.to && !loggedIn && redirectOnSuccess) {
      // Show lock when component mounts. NOTE: render method returns null.
      auth0.loginWithRedirect({
        redirectUri: `${window.location.origin}/login?to=${redirectOnSuccess}`
      })
    }
  }

  componentDidUpdate () {
    const { loggedIn, query } = this.props
    if (query.to && loggedIn) {
      browserHistory.push(query.to)
    }
  }

  render () {
    return null
  }
}
