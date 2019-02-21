// @flow

import React, {Component} from 'react'
import {Row, Col, Panel, ListGroup, ListGroupItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import * as projectsActions from '../actions/projects'
import {getComponentMessages, isModuleEnabled} from '../../common/util/config'
import DeploymentSettings from './DeploymentSettings'
import ProjectSettingsForm from './ProjectSettingsForm'

import type {Props as ContainerProps} from '../containers/ProjectSettings'
import type {Project} from '../../types'

type Props = ContainerProps & {
  deleteProject: typeof projectsActions.deleteProject,
  updateProject: typeof projectsActions.updateProject
}

export default class ProjectSettings extends Component<Props> {
  messages = getComponentMessages('ProjectSettings')

  _updateProjectSettings = (project: Project, settings: Object) => {
    const {updateProject} = this.props
    // Update project and re-fetch feeds.
    updateProject(project.id, settings, true)
  }

  render () {
    const {
      activeSubComponent,
      deleteProject,
      project,
      projectEditDisabled,
      updateProject
    } = this.props
    const activePanel = !activeSubComponent
      ? <ProjectSettingsForm
        deleteProject={deleteProject}
        editDisabled={projectEditDisabled}
        onCancelUrl={`project/${project.id}/`}
        project={project}
        updateProject={updateProject}
        showDangerZone
      />
      : <DeploymentSettings
        project={project}
        updateProject={updateProject}
        editDisabled={projectEditDisabled} />
    return (
      <Row>
        <Col xs={12} sm={3}>
          <Panel>
            <ListGroup fill>
              <LinkContainer
                to={`/project/${project.id}/settings`}>
                <ListGroupItem>
                  {this.messages('title')}
                </ListGroupItem>
              </LinkContainer>
              {isModuleEnabled('deployment')
                ? (
                  <LinkContainer
                    data-test-id='deployment-settings-link'
                    to={`/project/${project.id}/settings/deployment`}
                  >
                    <ListGroupItem>{this.messages('deployment.title')}</ListGroupItem>
                  </LinkContainer>
                )
                : null
              }
            </ListGroup>
          </Panel>
        </Col>
        <Col xs={12} sm={7}>
          {activePanel}
        </Col>
      </Row>
    )
  }
}
