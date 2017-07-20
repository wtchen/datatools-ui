import omit from 'lodash.omit'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {browserHistory, Router, Route} from 'react-router'

import ActiveUserAdmin from '../../admin/containers/ActiveUserAdmin'
import MainAlertsViewer from '../../alerts/containers/MainAlertsViewer'
import ActiveAlertEditor from '../../alerts/containers/ActiveAlertEditor'
import PageNotFound from '../components/PageNotFound'
import Login from '../containers/Login'
import ActiveGtfsEditor from '../../editor/containers/ActiveGtfsEditor'
import {checkLogin} from '../../manager/actions/user'
import ActiveDeploymentViewer from '../../manager/containers/ActiveDeploymentViewer'
import ActiveFeedSourceViewer from '../../manager/containers/ActiveFeedSourceViewer'
import ActiveProjectsList from '../../manager/containers/ActiveProjectsList'
import ActiveProjectViewer from '../../manager/containers/ActiveProjectViewer'
import ActiveUserHomePage from '../../manager/containers/ActiveUserHomePage'
import ActivePublicFeedSourceViewer from '../../public/containers/ActivePublicFeedSourceViewer'
import ActivePublicFeedsViewer from '../../public/containers/ActivePublicFeedsViewer'
import ActiveSignupPage from '../../public/containers/ActiveSignupPage'
import ActiveUserAccount from '../../public/containers/ActiveUserAccount'
import ActiveGtfsPlusEditor from '../../gtfsplus/containers/ActiveGtfsPlusEditor'
import ActiveSignEditor from '../../signs/containers/ActiveSignEditor'
import MainSignsViewer from '../../signs/containers/MainSignsViewer'
import {isModuleEnabled} from '../util/config'

function wrapComponentInAuthStrategy (
  ComponentToWrap,
  requireAuth,
  requireAdmin
) {
  class AuthStrategyWrapper extends Component {
    componentWillMount () {
      const {checkLogin, user} = this.props
      if (!user.token) {
        // user is not logged in, try to silently log them in
        checkLogin()
      } else {
        this._checkIfAdmin()
      }
    }

    componentWillReceiveProps () {
      this._checkIfAdmin()
    }

    _userHasAdminViewPrivileges () {
      const {user} = this.props
      return !!(user &&
        user.permissions &&
        (user.permissions.isApplicationAdmin() ||
          user.permissions.canAdministerAnOrganization()
        )
      )
    }

    _checkIfAdmin () {
      if (requireAdmin && !this._userHasAdminViewPrivileges()) {
        browserHistory.push('/')
      }
    }

    _onLoginHide = () => {
      browserHistory.push('/')
    }

    render () {
      const {user} = this.props
      if (requireAuth && !user.token) {
        if (user.isCheckingLogin) {
          return (
            <div>
              <p>Attempting to renew login...</p>
            </div>
          )
        } else {
          return (
            <Login
              onHide={this._onLoginHide}
              />
          )
        }
      } else {
        if (requireAdmin && !this._userHasAdminViewPrivileges()) {
          return (
            <div>
              <p>You have attempted to view a restricted page without proper credentials</p>
            </div>
          )
        } else {
          return (
            <ComponentToWrap
              {...omit(this.props, ['checkLogin', 'children', 'user'])}
              />
          )
        }
      }
    }
  }

  return connect(state => ({user: state.user}), {checkLogin})(
    AuthStrategyWrapper
  )
}

function loginOptional (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap)
}

function authRequired (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap, true)
}

function adminRequired (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap, true, true)
}

export default class App extends Component {
  render () {
    const {history} = this.props
    const routes = [
      {
        path: '/settings(/:subpage)(/:projectId)',
        component: authRequired(ActiveUserAccount)
      },
      {
        path: '/admin(/:subpage)',
        component: adminRequired(ActiveUserAdmin)
      },
      {path: '/signup', component: loginOptional(ActiveSignupPage)},
      {
        path: '/home(/:projectId)',
        component: authRequired(ActiveUserHomePage)
      },
      {path: '/', component: loginOptional(ActivePublicFeedsViewer)},
      {
        path: '/public/feed/:feedSourceId(/version/:feedVersionIndex)',
        component: loginOptional(ActivePublicFeedSourceViewer)
      },
      {
        path: '/project',
        component: authRequired(ActiveProjectsList)
      },
      {
        path: '/project/:projectId(/:subpage)(/:subsubpage)',
        component: authRequired(ActiveProjectViewer)
      },
      {
        path:
          '/feed/:feedSourceId/edit(/:activeComponent)(/:activeEntityId)(/:subComponent)(/:subEntityId)(/:subSubComponent)(/:activeSubSubEntity)',
        component: authRequired(ActiveGtfsEditor)
      },
      {
        path:
          '/feed/:feedSourceId(/version/:feedVersionIndex)(/:subpage)(/:subsubpage)',
        component: authRequired(ActiveFeedSourceViewer)
      },
      {
        path: '/deployment/:deploymentId',
        component: authRequired(ActiveDeploymentViewer)
      },
      {
        path: '/gtfsplus/:feedSourceId/:feedVersionId',
        component: authRequired(ActiveGtfsPlusEditor)
      },
      {path: '*', component: loginOptional(PageNotFound)}
    ]

    // register routes if alerts module enabled (unshift so they're before wildcard route)
    if (isModuleEnabled('alerts')) {
      routes.unshift(
        {
          path: 'alerts',
          component: authRequired(MainAlertsViewer)
        },
        {
          path: 'alerts/new',
          component: authRequired(ActiveAlertEditor)
        },
        {
          path: 'alerts/alert/:alertId',
          component: authRequired(ActiveAlertEditor)
        }
      )
    }

    // register routes if sign_config module enabled (unshift so they're before wildcard route)
    if (isModuleEnabled('sign_config')) {
      routes.unshift(
        {path: 'signs', component: authRequired(MainSignsViewer)},
        {
          path: 'signs/new',
          component: authRequired(ActiveSignEditor)
        },
        {
          path: 'signs/sign/:signId',
          component: authRequired(ActiveSignEditor)
        }
      )
    }

    return (
      <Router history={history}>
        {routes.map((r, i) => <Route {...r} key={i} />)}
      </Router>
    )
  }
}
