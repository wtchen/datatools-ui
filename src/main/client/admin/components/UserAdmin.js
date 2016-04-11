import fetch  from 'isomorphic-fetch'
import React  from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import UserList from './UserList'

export default class UserAdmin extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      user: null
    }

    // var login = this.auth0.checkExistingLogin()
    // if (login) this.handleLogin(login)
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  isAdmin () {
    var appAdmin = this.props.user && this.props.user.permissions && this.props.user.permissions.isApplicationAdmin()
    return appAdmin
  }

  render () {
    return (
      <ManagerPage ref='page'>
        {
          this.isAdmin() &&
          this.props.users &&
          this.props.projects
          ? <UserList
            token={this.props.user.token}
            projects={this.props.projects}
            users={this.props.users}
            setUserPermission={this.props.setUserPermission}
            saveUser={this.props.saveUser}
            fetchFeedsForProject={this.props.fetchFeedsForProject}
            createUser={this.props.createUser}
          />
          : (
            <Grid><Row><Col xs={12}>
              {this.state.user
                ? <p>You do not have sufficient user privileges to access this area</p>
                : <p>You must be an admin to access this area</p>
              }
            </Col></Row></Grid>
          )
        }
      </ManagerPage>
    )
  }
}
