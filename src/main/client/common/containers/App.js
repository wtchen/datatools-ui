import React from 'react'
import { connect } from 'react-redux'
import { Router, Route, Redirect } from 'react-router'

import { checkExistingLogin, userLoggedIn, login } from '../../manager/actions/user'
import { checkJobStatus } from '../../manager/actions/status'

// import NoAccessScreen from '../components/NoAccessScreen'
import ActiveFeedSourceViewer from '../../manager/containers/ActiveFeedSourceViewer'
import ActiveProjectViewer from '../../manager/containers/ActiveProjectViewer'
import ActiveProjectsList from '../../manager/containers/ActiveProjectsList'
import ActivePublicFeedSourceViewer from '../../public/containers/ActivePublicFeedSourceViewer'
import ActiveDeploymentViewer from '../../manager/containers/ActiveDeploymentViewer'
import ActivePublicFeedsViewer from '../../public/containers/ActivePublicFeedsViewer'
import ActiveSignupPage from '../../public/containers/ActiveSignupPage'
import ActiveUserAccount from '../../public/containers/ActiveUserAccount'
import ActiveUserAdmin from '../../admin/containers/ActiveUserAdmin'
import MainAlertsViewer from '../../alerts/containers/MainAlertsViewer'
import ActiveAlertEditor from '../../alerts/containers/ActiveAlertEditor'
import MainSignsViewer from '../../signs/containers/MainSignsViewer'
import ActiveSignEditor from '../../signs/containers/ActiveSignEditor'
import PageNotFound from '../components/PageNotFound'
import ActiveGtfsPlusEditor from '../../gtfsplus/containers/ActiveGtfsPlusEditor'
import ActiveGtfsEditor from '../../editor/containers/ActiveGtfsEditor'
import ActiveGtfsTableEditor from '../../editor/containers/ActiveGtfsTableEditor'

import ActiveGtfsValidationMap from '../../manager/containers/validation/ActiveGtfsValidationMap'
import ActiveGtfsValidationExplorer from '../../manager/containers/validation/ActiveGtfsValidationExplorer'

require('../style.css')

// import { UserIsAuthenticated, UserIsAdmin } from '../util/util'

class App extends React.Component {

  constructor (props) {
    super(props)
  }

  componentDidMount () {
    // set up status checkLogin
    /*setInterval(() => {
      console.log('status check!', this.props.user);
      this.props.checkJobStatus()
    }, 5000)*/
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
        }
        else {
          callback()
        }
      })
    }

    const requireAdmin = (nextState, replace, callback) => {
      this.props.checkExistingLogin()
      .then((action) => {
        console.log('requiring admin')
        if (this.props.user.profile === null || !this.props.user.permissions.isApplicationAdmin()) {
          replace(null, '/')
        }
        callback()
      })
    }
    const routes = [
      <Route path='/account' component={ActiveUserAccount} onEnter={requireAuth} />,
      <Route path='/admin' component={ActiveUserAdmin} onEnter={requireAdmin} />,
      <Route path='/signup' component={ActiveSignupPage} />,
      <Route path='/' component={ActivePublicFeedsViewer} />,
      <Route path='/public/feed/:feedSourceId(/version/:feedVersionIndex)' component={ActivePublicFeedSourceViewer} />,
      <Route path='alerts' component={MainAlertsViewer} onEnter={requireAuth} />,
      <Route path='alerts/new' component={ActiveAlertEditor} onEnter={requireAuth} />,
      <Route path='alerts/alert/:alertId' component={ActiveAlertEditor} onEnter={requireAuth} />,
      <Route path='signs' component={MainSignsViewer} onEnter={requireAuth} />,
      <Route path='signs/new' component={ActiveSignEditor} onEnter={requireAuth} />,
      <Route path='signs/sign/:signId' component={ActiveSignEditor} onEnter={requireAuth} />,
      <Route path='/project' component={ActiveProjectsList} onEnter={requireAuth} />,
      <Route path='/project/:projectId(/:subpage)' component={ActiveProjectViewer} onEnter={requireAuth} />,
      <Route path='/feed/:feedSourceId/edit(/:subpage)(/:entity)(/:subsubpage)(/:subentity)(/:subsubcomponent)(/:subsubentity)' component={ActiveGtfsEditor} onEnter={requireAuth} />,
      <Route path='/feed/:feedSourceId(/version/:feedVersionIndex)(/:subpage)' component={ActiveFeedSourceViewer} onEnter={requireAuth} />,
      <Route path='/feed/:feedSourceId/:feedVersionId' component={ActiveGtfsValidationMap} onEnter={requireAuth} />,
      <Route path='/feed/:feedSourceId/validation/:feedVersionIndex' component={ActiveGtfsValidationExplorer} onEnter={requireAuth} />,
      <Route path='/deployment/:deploymentId' component={ActiveDeploymentViewer} onEnter={requireAuth} />,
      <Route path='/gtfsplus/:feedSourceId/:feedVersionId' component={ActiveGtfsPlusEditor} onEnter={requireAuth} />,
      <Route path='/feed/:feedSourceId/editTable/:feedVersionId(/:subpage)' component={ActiveGtfsTableEditor} onEnter={requireAuth} />,
      <Route path='*' component={PageNotFound} />,
    ]
    return (
      <Router history={this.props.history}>
        {routes}
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

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
