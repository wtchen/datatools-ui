import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'

import { checkExistingLogin, login } from '../../manager/actions/user'
import { checkJobStatus } from '../../manager/actions/status'
import { isModuleEnabled } from '../util/config'

import ActiveFeedSourceViewer from '../../manager/containers/ActiveFeedSourceViewer'
import ActiveProjectViewer from '../../manager/containers/ActiveProjectViewer'
import ActiveProjectsList from '../../manager/containers/ActiveProjectsList'
import ActivePublicFeedSourceViewer from '../../public/containers/ActivePublicFeedSourceViewer'
import ActiveDeploymentViewer from '../../manager/containers/ActiveDeploymentViewer'
import ActivePublicFeedsViewer from '../../public/containers/ActivePublicFeedsViewer'
import ActiveSignupPage from '../../public/containers/ActiveSignupPage'
import ActiveUserHomePage from '../../manager/containers/ActiveUserHomePage'
import ActiveUserAccount from '../../public/containers/ActiveUserAccount'
import ActiveUserAdmin from '../../admin/containers/ActiveUserAdmin'
import MainAlertsViewer from '../../alerts/containers/MainAlertsViewer'
import ActiveAlertEditor from '../../alerts/containers/ActiveAlertEditor'
import MainSignsViewer from '../../signs/containers/MainSignsViewer'
import ActiveSignEditor from '../../signs/containers/ActiveSignEditor'
import PageNotFound from '../components/PageNotFound'
import ActiveGtfsPlusEditor from '../../gtfsplus/containers/ActiveGtfsPlusEditor'
import ActiveGtfsEditor from '../../editor/containers/ActiveGtfsEditor'

class App extends Component {
  static propTypes = {
    checkExistingLogin: PropTypes.func,
    user: PropTypes.object,
    login: PropTypes.func,
    history: PropTypes.object
  }
  render () {
    const requireAuth = (nextState, replace, callback) => {
      this.props.checkExistingLogin()
      .then((action) => {
        if (this.props.user.profile === null) {
          // replace(null, '/')
          this.props.login({closable: false}, callback)
          .then(() => {
            callback()
          })
        } else {
          callback()
        }
      })
    }
    const checkLogin = (nextState, replace, callback) => {
      this.props.checkExistingLogin()
      .then((action) => {
        callback()
      })
    }
    const requireAdmin = (nextState, replace, callback) => {
      this.props.checkExistingLogin()
      .then((action) => {
        console.log('requiring admin')
        if (this.props.user.profile === null || !this.props.user.permissions.isApplicationAdmin()) {
          browserHistory.push('/')
        } else {
          callback()
        }
      })
    }
    const routes = [
      {path: '/settings(/:subpage)(/:projectId)', component: ActiveUserAccount, onEnter: requireAuth},
      {path: '/admin(/:subpage)', component: ActiveUserAdmin, onEnter: requireAdmin},
      {path: '/signup', component: ActiveSignupPage, onEnter: checkLogin},
      {path: '/home(/:projectId)', component: ActiveUserHomePage, onEnter: requireAuth},
      {path: '/', component: ActivePublicFeedsViewer, onEnter: checkLogin},
      {path: '/public/feed/:feedSourceId(/version/:feedVersionIndex)', component: ActivePublicFeedSourceViewer, onEnter: checkLogin},
      {path: '/project', component: ActiveProjectsList, onEnter: requireAuth},
      {path: '/project/:projectId(/:subpage)(/:subsubpage)', component: ActiveProjectViewer, onEnter: requireAuth},
      {
        path: '/feed/:feedSourceId/edit(/:activeComponent)(/:activeEntityId)(/:subComponent)(/:subEntityId)(/:subSubComponent)(/:activeSubSubEntity)',
        component: ActiveGtfsEditor,
        onEnter: requireAuth
      },
      {path: '/feed/:feedSourceId(/version/:feedVersionIndex)(/:subpage)(/:subsubpage)', component: ActiveFeedSourceViewer, onEnter: requireAuth},

      {path: '/deployment/:deploymentId', component: ActiveDeploymentViewer, onEnter: requireAuth},
      {path: '/gtfsplus/:feedSourceId/:feedVersionId', component: ActiveGtfsPlusEditor, onEnter: requireAuth},
      {path: '*', component: PageNotFound}
    ]

    // register routes if alerts module enabled
    if (isModuleEnabled('alerts')) {
      routes.unshift(
        {path: 'alerts', component: MainAlertsViewer, onEnter: requireAuth},
        {path: 'alerts/new', component: ActiveAlertEditor, onEnter: requireAuth},
        {path: 'alerts/alert/:alertId', component: ActiveAlertEditor, onEnter: requireAuth},
      )
    }

    // register routes if sign_config module enabled
    if (isModuleEnabled('sign_config')) {
      routes.unshift(
        {path: 'signs', component: MainSignsViewer, onEnter: requireAuth},
        {path: 'signs/new', component: ActiveSignEditor, onEnter: requireAuth},
        {path: 'signs/sign/:signId', component: ActiveSignEditor, onEnter: requireAuth},
      )
    }

    return (
      <Router history={this.props.history}>
        {routes.map((r, i) => (<Route {...r} key={i} />))}
      </Router>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    checkJobStatus: () => dispatch(checkJobStatus()),
    checkExistingLogin: (callback) => dispatch(checkExistingLogin()),
    login: (options) => dispatch(login(null, null, options))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
