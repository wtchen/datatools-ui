// @flow

import React, {Component} from 'react'
import {Col, Grid, Row} from 'react-bootstrap'

import ManagerPage from '../../common/components/ManagerPage'
import GeneralSettings from './GeneralSettings'

import type {Project} from '../../types'

type Props = {
  createProject: (Project) => void
}

/**
 * A component to facilitate the creation of a new project.
 */
export default class CreateProject extends Component {
  props: Props

  _saveProject = (project: {}, data: Project) => {
    this.props.createProject(data)
  }

  render () {
    return (
      <ManagerPage
        ref='page'
        title={'Create New Project'}>
        <Grid fluid>
          <Row>
            <Col xs={12} sm={8}>
              <h2>Create New Project</h2>
              <GeneralSettings
                project={{ name: '' }}
                updateProject={this._saveProject}
                />
            </Col>
          </Row>
        </Grid>
      </ManagerPage>
    )
  }
}
