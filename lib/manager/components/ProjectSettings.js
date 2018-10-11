// @flow

import React, {Component} from 'react'
import { Row, Col, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

import {deleteProject, updateProject} from '../actions/projects'
import DeploymentSettings from './DeploymentSettings'
import GeneralSettings from './GeneralSettings'
import { isModuleEnabled, getComponentMessages, getMessage } from '../../common/util/config'

import type {Project} from '../../types'

type Props = {
  activeSettingsPanel?: string,
  deleteProject: typeof deleteProject,
  project: Project,
  projectEditDisabled: boolean,
  updateProject: typeof updateProject
}

const messages = getComponentMessages('ProjectSettings')

export default class ProjectSettings extends Component<Props> {
  _updateProjectSettings = (project: Project, settings: Object) => {
    const {updateProject} = this.props
    // Update project and re-fetch feeds.
    updateProject(project.id, settings, true)
  }

  render () {
    const {
      activeSettingsPanel,
      deleteProject,
      project,
      projectEditDisabled,
      updateProject
    } = this.props
    const activePanel = !activeSettingsPanel
      ? <GeneralSettings
        deleteProject={deleteProject}
        editDisabled={projectEditDisabled}
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
              <LinkContainer to={`/project/${project.id}/settings`}><ListGroupItem>{getMessage(messages, 'fields.title')}</ListGroupItem></LinkContainer>
              {isModuleEnabled('deployment')
                ? (
                  <LinkContainer
                    data-test-id='deployment-settings-link'
                    to={`/project/${project.id}/settings/deployment`}
                  >
                    <ListGroupItem>{getMessage(messages, 'deployment.title')}</ListGroupItem>
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
