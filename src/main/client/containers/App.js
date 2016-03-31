import React from 'react'
import { connect } from 'react-redux'
import { Router, Route, Redirect } from 'react-router'

import NoAccessScreen from '../components/NoAccessScreen'
import ActiveProjectsList from '../containers/ActiveProjectsList'
import ActiveProjectViewer from '../containers/ActiveProjectViewer'
import ActiveFeedSourceViewer from '../containers/ActiveFeedSourceViewer'
import ActivePublicFeedsViewer from '../containers/ActivePublicFeedsViewer'
import ActivePublicFeedSourceViewer from '../containers/ActivePublicFeedSourceViewer'
import ActiveUserAccount from '../containers/ActiveUserAccount'
import ActiveSignupPage from '../containers/ActiveSignupPage'
import ActiveUserAdmin from '../containers/ActiveUserAdmin'


import { checkExistingLogin, userLoggedIn } from '../actions/user'
import { fetchConfig } from '../actions/config'

// import { UserIsAuthenticated, UserIsAdmin } from '../util/util'

class App extends React.Component {

  constructor (props) {
    super(props)
  }

  componentDidMount () {
    if (!this.props.config.title){
      this.props.fetchConfig()
      .then(() => {
        this.props.checkExistingLogin()
        .then((action) => {
          console.log('got config + login')
        })
      })
    }
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
      // checkLogin(callback).then(something => {
      //   if (this.props.user.profile === null) {
      //     replace(null, '/')
      //   }
      // })
        this.props.fetchConfig()
        .then(() => {
          this.props.checkExistingLogin()
          .then((action) => {
            console.log('requiring auth')
            if (this.props.user.profile === null) {
              replace(null, '/')
            }
            callback()
          })
        })
    }

    const requireAdmin = (nextState, replace, callback) => {
      this.props.fetchConfig()
      .then(() => {
        this.props.checkExistingLogin()
        .then((action) => {
          console.log('requiring admin')
          if (!this.props.user.permissions.isApplicationAdmin()) {
            replace(null, '/')
          }
          callback()
        })
      })
    }

    let canAccess = false, noAccessReason
    if(this.props.user.profile === null) {
      noAccessReason = 'NOT_LOGGED_ID'
    }
    else {
      canAccess = true
    }
    return (
      // AUTH WITH HOC
      // <Router history={this.props.history}>
      //   <Redirect from='/' to='explore' />
      //   <Route path='/account' component={UserIsAuthenticated(ActiveUserAccount)} />
      //   <Route path='/admin' component={UserIsAdmin(ActiveUserAdmin)} />
      //   <Route path='/signup' component={ActiveSignupPage} />
      //   <Route path='/explore' component={ActivePublicFeedsViewer} />
      //   <Route path='/public/feed/:feedSourceId' component={ActivePublicFeedSourceViewer} />
      //   <Route path='/project' component={UserIsAuthenticated(ActiveProjectsList)} />
      //   <Route path='/project/:projectId' component={UserIsAuthenticated(ActiveProjectViewer)} />
      //   <Route path='/feed/:feedSourceId' component={UserIsAuthenticated(ActiveFeedSourceViewer)} />
      // </Router>

      <Router history={this.props.history}>
        <Redirect from='/' to='explore' />
        <Route path='/account' component={ActiveUserAccount} onEnter={requireAuth} />
        <Route path='/admin' component={ActiveUserAdmin} onEnter={requireAdmin} />
        <Route path='/signup' component={ActiveSignupPage} />
        <Route path='/explore' component={ActivePublicFeedsViewer} />
        <Route path='/public/feed/:feedSourceId' component={ActivePublicFeedSourceViewer} />
        <Route path='/project' component={ActiveProjectsList} onEnter={requireAuth} />
        <Route path='/project/:projectId' component={ActiveProjectViewer} onEnter={requireAuth} />
        <Route path='/feed/:feedSourceId' component={ActiveFeedSourceViewer} onEnter={requireAuth} />
      </Router>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    config: state.config
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchConfig: () => dispatch(fetchConfig()),
    checkExistingLogin: (callback) => dispatch(checkExistingLogin())
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
