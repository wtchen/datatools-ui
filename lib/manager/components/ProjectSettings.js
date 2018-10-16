// @flow

import React from 'react'
import {Row, Col, Panel, ListGroup, ListGroupItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import {deleteProject, updateProject} from '../actions/projects'
import MessageComponent from '../../common/components/MessageComponent'
import {isModuleEnabled} from '../../common/util/config'
import DeploymentSettings from './DeploymentSettings'
import GeneralSettings from './GeneralSettings'

import type {Project} from '../../types'

type Props = {
  activeSettingsPanel: string,
  deleteProject: typeof deleteProject,
  project: Project,
  projectEditDisabled: boolean,
  updateProject: typeof updateProject
}

export default class ProjectSettings extends MessageComponent<Props> {
  _updateProjectSettings = (project: Project, settings: Object) => {
    const {updateProject} = this.props
    // Update project and re-fetch feeds.
    updateProject(project, settings, true)
  }

  render () {
    const {
      project,
      projectEditDisabled,
      activeSettingsPanel,
      deleteProject
    } = this.props
    const activePanel = !activeSettingsPanel
      ? <GeneralSettings
        project={project}
        updateProjectSettings={this._updateProjectSettings}
        deleteProject={deleteProject}
        editDisabled={projectEditDisabled} />
      : <DeploymentSettings
        project={project}
        // Used for leave hook to ensure unsaved settings are not lost
        updateProjectSettings={this._updateProjectSettings}
        editDisabled={projectEditDisabled} />
    return (
      <Row>
        <Col xs={12} sm={3}>
          <Panel>
            <ListGroup fill>
              <LinkContainer
                to={`/project/${project.id}/settings`}>
                <ListGroupItem>
                  {this.messages('general.title')}
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
