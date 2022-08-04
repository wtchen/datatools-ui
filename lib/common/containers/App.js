// @flow

import { Auth0Provider } from '@auth0/auth0-react'
// minified file is imported because of https://github.com/bugsnag/bugsnag-js/issues/366
import bugsnag from 'bugsnag-js/dist/bugsnag.min'
import createPlugin from 'bugsnag-react'
import * as React from 'react'
import { Router, Route, browserHistory } from 'react-router'
import { toast } from 'react-toastify'

import AdminPage from '../../admin/components/AdminPage'
import MainAlertsViewer from '../../alerts/containers/MainAlertsViewer'
import ActiveAlertEditor from '../../alerts/containers/ActiveAlertEditor'
import { clientID, DEFAULT_SCOPE, domain } from '../../common/user/Auth0Manager'
import PageNotFound from '../components/PageNotFound'
import ActiveGtfsEditor from '../../editor/containers/ActiveGtfsEditor'
import ActiveFeedSourceViewer from '../../manager/containers/ActiveFeedSourceViewer'
import ActiveProjectsList from '../../manager/containers/ActiveProjectsList'
import ActiveProjectViewer from '../../manager/containers/ActiveProjectViewer'
import ActivePublicLandingPage from '../../public/containers/ActivePublicLandingPage'
import ActiveUserAccount from '../../public/containers/ActiveUserAccount'
import ActiveUserHomePage from '../../manager/containers/ActiveUserHomePage'
import CreateProject from '../../manager/containers/CreateProject'
import ActiveGtfsPlusEditor from '../../gtfsplus/containers/ActiveGtfsPlusEditor'
import {logPageView} from '../util/analytics'
import type {dispatchFn, getStateFn} from '../../types/reducers'

import Login from './Login'
import wrapComponentInAuthStrategy from './wrapComponentInAuthStrategy'

function loginOptional (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap)
}

function authRequired (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap, true)
}

function adminRequired (ComponentToWrap) {
  return wrapComponentInAuthStrategy(ComponentToWrap, true, true)
}

type AppProps = {
  history: any,
  store: {
    dispatch: dispatchFn,
    getState: getStateFn
  }
}

export default class App extends React.Component<AppProps> {
  handleAccessTokenError = (err: any) => {
    const newError = new Error('accessToken not received from auth0')
    console.log(err)
    throw newError
  }

  render () {
    const routes = [
      {
        path: '/settings(/:subpage)(/:projectId)',
        component: authRequired(ActiveUserAccount)
      },
      {
        path: '/admin(/:subpage)',
        component: adminRequired(AdminPage)
      },
      {
        path: 'alerts',
        component: authRequired(MainAlertsViewer)
      },
      {
        path: 'alerts/new',
        component: authRequired(ActiveAlertEditor)
      },
      {
        path: 'alert/:alertId',
        component: authRequired(ActiveAlertEditor)
      },
      {
        path: '/home(/:projectId)',
        component: authRequired(ActiveUserHomePage)
      },
      {path: '/login', component: Login},
      {path: '/', component: loginOptional(ActivePublicLandingPage)},
      {
        path: '/project',
        component: authRequired(ActiveProjectsList)
      },
      {
        path: '/project/new',
        component: authRequired(CreateProject)
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
        path: '/gtfsplus/:feedSourceId/:feedVersionId',
        component: authRequired(ActiveGtfsPlusEditor)
      },
      {path: '*', component: loginOptional(PageNotFound)}
    ]
    const routerWithAuth0 = (
      <Auth0Provider
        audience=''
        clientId={clientID}
        domain={domain}
        onAccessTokenError={this.handleAccessTokenError}
        scope={DEFAULT_SCOPE}
      >
        <Router
          history={browserHistory}
          onUpdate={logPageView}>
          {routes.map((r, i) => (<Route {...r} key={i} />))}
        </Router>
      </Auth0Provider>
    )
    // Initialize toast notifications.
    toast.configure()
    // Configure bugsnag if key is provided.
    if (process.env.BUGSNAG_KEY) {
      const bugsnagClient = bugsnag(process.env.BUGSNAG_KEY)
      const ErrorBoundary = bugsnagClient.use(createPlugin(React))
      return (
        <ErrorBoundary>
          {routerWithAuth0}
        </ErrorBoundary>
      )
    } else {
      return routerWithAuth0
    }
  }
}
