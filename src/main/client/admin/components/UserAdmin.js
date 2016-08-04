import fetch  from 'isomorphic-fetch'
import React  from 'react'
import { Grid, Row, Col } from 'react-bootstrap'
import Helmet from 'react-helmet'

import ManagerPage from '../../common/components/ManagerPage'
import UserList from './UserList'
import { getComponentMessages } from '../../common/util/config'

export default class UserAdmin extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      user: null
    }
  }

  componentWillMount () {
    this.props.onComponentMount(this.props)
  }

  isAdmin () {
    var appAdmin = this.props.user && this.props.user.permissions && this.props.user.permissions.isApplicationAdmin()
    return appAdmin
  }

  render () {
    const messages = getComponentMessages('UserAdmin')
    return (
      <ManagerPage ref='page'>
      <Helmet
        title={messages.title}
      />
        {
          this.isAdmin() &&
          this.props.admin.users &&
          this.props.projects
          ? <UserList
              token={this.props.user.token}
              projects={this.props.projects}
              users={this.props.admin.users}
              userCount={this.props.admin.userCount}
              page={this.props.admin.page}
              perPage={this.props.admin.perPage}
              isFetching={this.props.admin.isFetching}

              setUserPermission={this.props.setUserPermission}
              saveUser={this.props.saveUser}
              deleteUser={this.props.deleteUser}
              fetchProjectFeeds={this.props.fetchProjectFeeds}
              createUser={this.props.createUser}
              setPage={this.props.setPage}
              userSearch={this.props.userSearch}
            />
          : <Grid fluid><Row><Col xs={12}>
              {this.state.user
                ? <p>You do not have sufficient user privileges to access this area</p>
                : <p>You must be an admin to access this area</p>
              }
            </Col></Row></Grid>
        }
      </ManagerPage>
    )
  }
}
