// @flow

import React, {Component} from 'react'
import {Grid} from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import GeneralSettings from './GeneralSettings'

/**
 * A component to facilitate the creation of a new project.
 */
export default class CreateProject extends Component {
  render () {
    return (
      <ManagerPage
        ref='page'
        title={'Create New Project'}>
        <Grid fluid>
          <h2>Create New Project</h2>
          <GeneralSettings
            project={{}}
            />
        </Grid>
      </ManagerPage>
    )
  }
}
