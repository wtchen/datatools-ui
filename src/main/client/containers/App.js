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

import { UserIsAuthenticated, UserIsAdmin } from '../util/util'

class App extends React.Component {

  constructor (props) {
    super(props)

    // this.props.fetchConfig().then(() => {
    //   return this.props.checkExistingLogin()
    // })
  }
  componentDidMount () {
    this.props.fetchConfig().then(() => {
      return this.props.checkExistingLogin()
    })
  }
  render () {
    // const requireAuth = (nextState, replace, callback) => {
    //   if (this.props.user.profile === null){
    //     replace(null, "/");
    //   }
    //   callback()
    //   // this.props.fetchConfig().then((action) => {
    //   //   console.log(action)
    //   //   this.props.checkExistingLogin()
    //   // }).then((something) => {
    //   //   console.log(something)
    //   //   callback()
    //   //   console.log(this.props)
    //   // }).then((result) => {
    //   //
    //   //   // callback()
    //   //   console.log(this.props)
    //   // })
    // }

    let canAccess = false, noAccessReason
    if(this.props.user.profile === null) {
      noAccessReason = 'NOT_LOGGED_ID'
    }
    else {
      canAccess = true
    }
    return (
      // AUTH WITH HOC
      <Router history={this.props.history}>
        <Redirect from='/' to='explore' />
        <Route path='/account' component={UserIsAuthenticated(ActiveUserAccount)} />
        <Route path='/admin' component={UserIsAdmin(ActiveUserAdmin)} />
        <Route path='/signup' component={ActiveSignupPage} />
        <Route path='/explore' component={ActivePublicFeedsViewer} />
        <Route path='/public/feed/:feedSourceId' component={ActivePublicFeedSourceViewer} />
        <Route path='/project' component={UserIsAuthenticated(ActiveProjectsList)} />
        <Route path='/project/:projectId' component={UserIsAuthenticated(ActiveProjectViewer)} />
        <Route path='/feed/:feedSourceId' component={UserIsAuthenticated(ActiveFeedSourceViewer)} />
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
    checkExistingLogin: (callback) => dispatch(checkExistingLogin(callback))
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
