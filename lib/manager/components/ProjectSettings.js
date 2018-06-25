import React, {Component, PropTypes} from 'react'
import { LinkContainer } from 'react-router-bootstrap'

import { Row, Col, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import GeneralSettings from './GeneralSettings'
import DeploymentSettings from './DeploymentSettings'
import { isModuleEnabled, getComponentMessages, getMessage } from '../../common/util/config'

export default class ProjectSettings extends Component {
  static propTypes = {
    project: PropTypes.object,
    projectEditDisabled: PropTypes.bool,
    updateProject: PropTypes.func,
    deleteProject: PropTypes.func
  }

  _updateProjectSettings = (project, settings) => {
    const {updateProject} = this.props
    // Update project and re-fetch feeds.
    updateProject(project, settings, true)
  }

  render () {
    const {
      project,
      projectEditDisabled,
      activeSettingsPanel,
      route,
      deleteProject
    } = this.props
    const messages = getComponentMessages('ProjectSettings')
    const activePanel = !activeSettingsPanel
      ? <GeneralSettings
        project={project}
        updateProjectSettings={this._updateProjectSettings}
        deleteProject={deleteProject}
        editDisabled={projectEditDisabled} />
      : <DeploymentSettings
        project={project}
        // Used for leave hook to ensure unsaved settings are not lost
        route={route}
        updateProjectSettings={this._updateProjectSettings}
        editDisabled={projectEditDisabled} />
    return (
      <Row>
        <Col xs={12} sm={3}>
          <Panel>
            <ListGroup fill>
              <LinkContainer to={`/project/${project.id}/settings`}><ListGroupItem>{getMessage(messages, 'general.title')}</ListGroupItem></LinkContainer>
              {isModuleEnabled('deployment')
                ? <LinkContainer to={`/project/${project.id}/settings/deployment`}><ListGroupItem>{getMessage(messages, 'deployment.title')}</ListGroupItem></LinkContainer>
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
