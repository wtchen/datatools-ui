// @flow

import { Component } from 'react'

import type { Props as ContainerProps } from '../containers/Login'

type Props = ContainerProps & {
  loggedIn: boolean,
  push: string => void
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
    const { loggedIn, push, query } = this.props
    if (query.to && loggedIn) {
      push(query.to)
    }
  }

  render () {
    return null
  }
}
