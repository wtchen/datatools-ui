import React from 'react'
import { connect } from 'react-redux'
import { Router, Route } from 'react-router'

import NoAccessScreen from '../components/NoAccessScreen'
import VisibleProjectsList from '../containers/VisibleProjectsList'
import ProjectViewer from '../components/ProjectViewer'
import { checkExistingLogin, userLoggedIn } from '../actions/user'
import { fetchConfig } from '../actions/config'

class App extends React.Component {

  constructor (props) {
    super(props)

    this.props.fetchConfig().then(() => {
      return this.props.checkExistingLogin()
    })
  }

  render () {

    let canAccess = false, noAccessReason
    if(this.props.user.profile === null) {
      noAccessReason = 'NOT_LOGGED_ID'
    }
    else {
      canAccess = true
    }

``
    return (
      <div>
        {!canAccess
          ? <NoAccessScreen reason={noAccessReason} />
          : <Router history={this.props.history}>
            <Route path='/' component={VisibleProjectsList} />
            <Route path='/project/:projectId' component={ProjectViewer} />

          </Router>
        }
      </div>
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
    checkExistingLogin: () => dispatch(checkExistingLogin())
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
