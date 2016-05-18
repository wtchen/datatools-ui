import React from 'react'
import { connect } from 'react-redux'
import { Router, Route, Redirect } from 'react-router'

import { checkExistingLogin, userLoggedIn } from '../../manager/actions/user'
// import NoAccessScreen from '../components/NoAccessScreen'
import ActiveFeedSourceViewer from '../../manager/containers/ActiveFeedSourceViewer'
import ActiveProjectViewer from '../../manager/containers/ActiveProjectViewer'
import ActiveProjectsList from '../../manager/containers/ActiveProjectsList'
import ActivePublicFeedSourceViewer from '../../public/containers/ActivePublicFeedSourceViewer'
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

import ActiveGtfsValidationMap from '../../manager/containers/validation/ActiveGtfsValidationMap'
import ActiveGtfsValidationExplorer from '../../manager/containers/validation/ActiveGtfsValidationExplorer'

// import { UserIsAuthenticated, UserIsAdmin } from '../util/util'

class App extends React.Component {

  constructor (props) {
    super(props)
  }

  componentDidMount () {
    this.props.checkExistingLogin()
    .then((action) => {
      console.log('got config + login')
    })
  }

  render () {
    const checkLogin = (callback) => {
      return this.props.fetchConfig()
      .then(() => {
        this.props.checkExistingLogin()
        .then((action) => {
          console.log(action)
          callback()
        })
      })
    }

    const requireAuth = (nextState, replace, callback) => {
      this.props.checkExistingLogin()
      .then((action) => {
        console.log('requiring auth')
        if (this.props.user.profile === null) {
          replace(null, '/')
        }
        callback()
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

    return (
      <Router history={this.props.history}>
        <Route path='/account' component={ActiveUserAccount} onEnter={requireAuth} />
        <Route path='/admin' component={ActiveUserAdmin} onEnter={requireAdmin} />
        <Route path='/signup' component={ActiveSignupPage} />
        <Route path='/' component={ActivePublicFeedsViewer} />
        <Route path='/public/feed/:feedSourceId' component={ActivePublicFeedSourceViewer} />
        <Route path='alerts' component={MainAlertsViewer} onEnter={requireAuth} />
        <Route path='alerts/new' component={ActiveAlertEditor} onEnter={requireAuth} />
        <Route path='alerts/alert/:alertId' component={ActiveAlertEditor} onEnter={requireAuth} />
        <Route path='signs' component={MainSignsViewer} onEnter={requireAuth} />
        <Route path='signs/new' component={ActiveSignEditor} onEnter={requireAuth} />
        <Route path='signs/sign/:signId' component={ActiveSignEditor} onEnter={requireAuth} />
        <Route path='/project' component={ActiveProjectsList} onEnter={requireAuth} />
        <Route path='/project/:projectId' component={ActiveProjectViewer} onEnter={requireAuth} />
        <Route path='/feed/:feedSourceId' component={ActiveFeedSourceViewer} onEnter={requireAuth} />
        <Route path='/feed/:feedSourceId/:feedVersionId' component={ActiveGtfsValidationMap} onEnter={requireAuth} />
        <Route path='/feed/:feedSourceId/validation/:feedVersionIndex' component={ActiveGtfsValidationExplorer} onEnter={requireAuth} />

        <Route path='/gtfsplus/:feedSourceId/:feedVersionId' component={ActiveGtfsPlusEditor} onEnter={requireAuth} />

        <Route path='*' component={PageNotFound} />
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
    checkExistingLogin: (callback) => dispatch(checkExistingLogin())
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
