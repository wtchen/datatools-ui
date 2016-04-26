import React from 'react'
import { Row, Col, Input, Panel, SplitButton, MenuItem, Label, ButtonGroup, Button } from 'react-bootstrap'
import update from 'react-addons-update'

import allPermissions from './permissions'

export default class UserSettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      appAdminChecked: this.props.permissions.isApplicationAdmin(),
      currentProjectIndex: 0,
      projectSettings: {},
    }
    console.log(this.props.projects)
    this.props.projects.forEach((project, i) => {
      console.log(project.id)
      console.log(this.props.permissions)
      let access = 'none'
      let defaultFeeds = []
      let permissions = []
      console.log(this.props.permissions.hasProject(project.id))
      if(this.props.permissions.hasProject(project.id)) {
        if(this.props.permissions.isProjectAdmin(project.id)) {
          console.log('is admin')
          access = 'admin'
        }
        else {
          console.log('custom')
          access = 'custom'
          let projectPermissions = this.props.permissions.getProjectPermissions(project.id)
          permissions = projectPermissions.map((p) => { return p.type })
          defaultFeeds = this.props.permissions.getProjectDefaultFeeds(project.id)
        }
      }
      console.log({ access, defaultFeeds, permissions })
      this.state.projectSettings[project.id] = { access, defaultFeeds, permissions }
    })
    console.log(this.state)
  }

  getSettings () {
    console.log(this.state)
    if(this.state.appAdminChecked) {
      return {
        permissions: [{
          type: 'administer-application'
        }],
        projects: []
      }
    }

    let settings = { permissions: [], projects: [] }

    this.props.projects.forEach((project, i) => {
      let stateProjectSettings = this.state.projectSettings[project.id]
      if (stateProjectSettings.access === 'none') return

      let projectSettings = {
        project_id: project.id,
        permissions: []
      }
      if (stateProjectSettings.access === 'admin') {
        projectSettings.permissions.push({
          type: 'administer-project'
        })
      } else if (stateProjectSettings.access === 'custom') {
        projectSettings.defaultFeeds = stateProjectSettings.defaultFeeds
        // users have view-all permissions by default
        projectSettings.permissions.push({
          type: 'view-feed',
          feeds: ['*']
        })
        projectSettings.permissions = projectSettings.permissions.concat(stateProjectSettings.permissions.map((permission) => {
          return { type: permission }
        }))
      }
      settings.projects.push(projectSettings)
    })

    return settings
  }

  projectSelected (evt, key) {
    let currentProject = this.props.projects[key]
    this.setState({
      currentProjectIndex: key
    })
    console.log('project selected', key, currentProject)
  }

  appAdminClicked () {
    this.setState({
      appAdminChecked: this.refs['appAdminCheckbox'].getChecked()
    })
  }

  projectAccessUpdated(projectId, newAccess) {

    var stateUpdate = { projectSettings: { [projectId]: { $merge : { access : newAccess } } } };
    this.setState(update(this.state, stateUpdate));
    console.log('project access updated', stateUpdate)
    console.log(this.state)
  }

  projectFeedsUpdated(projectId, newFeeds) {
    var stateUpdate = { projectSettings: { [projectId]: { $merge : { defaultFeeds : newFeeds } } } };
    this.setState(update(this.state, stateUpdate));
  }

  projectPermissionsUpdated(projectId, newPermissions) {
    var stateUpdate = { projectSettings: { [projectId]: { $merge : { permissions : newPermissions } } } };
    this.setState(update(this.state, stateUpdate));
  }

  render () {
    let currentProject = this.props.projects[this.state.currentProjectIndex]

    let projectPanel = (
      <Panel header={
        <h3>
          Project Settings for&nbsp;
          <SplitButton
            title={currentProject.name}
            onSelect={this.projectSelected.bind(this)}
            pullRight
          >
            {this.props.projects.map((project, i) => {
              let settings = this.state.projectSettings[project.id]
              if (typeof settings !== 'undefined')
                return <MenuItem eventKey={i}>{project.name} {getProjectLabel(settings.access)}</MenuItem>
            })}
          </SplitButton>
        </h3>
      }
      >
      <div></div>
      {this.props.projects.map((project, i) => {
        // console.log(projectSettings)
        let settings = this.state.projectSettings[project.id]
        return <ProjectSettings
          project={project}
          settings={settings}
          fetchProjectFeeds={this.props.fetchProjectFeeds}
          visible={(i === this.state.currentProjectIndex)}
          projectAccessUpdated={this.projectAccessUpdated.bind(this)}
          projectFeedsUpdated={this.projectFeedsUpdated.bind(this)}
          projectPermissionsUpdated={this.projectPermissionsUpdated.bind(this)}
        />
      })}
    </Panel>)

    return (
      <Row>
        <Col xs={4}>
          <Panel header={<h3>Application Settings</h3>}>
            <Input
              type='checkbox'
              label='Application Administrator'
              defaultChecked={this.state.appAdminChecked}
              onClick={this.appAdminClicked.bind(this)}
              ref='appAdminCheckbox'
            />
          </Panel>
        </Col>
        <Col xs={8}>
          {this.state.appAdminChecked
            ? <i>Application administrators have full access to all projects.</i>
            : projectPanel
          }
        </Col>
      </Row>
    )
  }
}

function getProjectLabel(access) {
  switch(access) {
    case 'none': return <Label>None</Label>
    case 'admin': return <Label bsStyle="primary">Admin</Label>
    case 'custom': return <Label bsStyle="success">Custom</Label>
  }
}

class ProjectSettings extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      projectSettings: this.props.settings
    }
  }
  static propTypes = {
    project: React.PropTypes.object.isRequired,
    settings: React.PropTypes.object.isRequired
  }
  componentWillMount () {
    if (!this.props.project.feedSources) {
      console.log('fetchingFeeds for ' + this.props.project.id)
      this.props.fetchProjectFeeds(this.props.project.id)
    }
  }
  setAccess (access) {
    console.log(access)
    this.props.projectAccessUpdated(this.props.project.id, access)
  }

  feedsUpdated () {
    let selectedFeeds = []
    this.props.project.feedSources.forEach((feed) => {
      var checkbox = this.refs['feed-' + feed.id]
      if(checkbox.getChecked()) selectedFeeds.push(feed.id)
    })
    this.props.projectFeedsUpdated(this.props.project.id, selectedFeeds)
  }

  permissionsUpdated () {
    let selectedPermissions = []
    allPermissions.forEach((permission) => {
      var checkbox = this.refs['permission-' + permission.type]
      if(checkbox.getChecked()) selectedPermissions.push(permission.type)
    })
    this.props.projectPermissionsUpdated(this.props.project.id, selectedPermissions)
  }

  render () {
    let lookup = {}
    return (
      <Row style={{display: this.props.visible ? 'block' : 'none'}}>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <ButtonGroup pullRight>
                <Button
                  active={this.props.settings.access === 'none'}
                  onClick={this.setAccess.bind(this, 'none')}
                >No Access</Button>

                <Button
                  active={this.props.settings.access === 'admin'}
                  onClick={this.setAccess.bind(this, 'admin')}
                >Admin</Button>

                <Button
                  active={this.props.settings.access === 'custom'}
                  onClick={this.setAccess.bind(this, 'custom')}
                >Custom</Button>
              </ButtonGroup>
            </Col>
          </Row>
          {this.props.settings.access === 'custom' ? (
            <Row>
              <Col xs={6}>
                <h4>Feed Sources</h4>
                {this.props.project.feedSources ? this.props.project.feedSources.map((feed, i) => {
                  let name = (feed.name === '') ? '(unnamed feed)' : feed.name
                  let ref = 'feed-' + feed.id
                  let checked = this.props.settings.defaultFeeds.indexOf(feed.id) !== -1
                  return <Input
                    ref={ref}
                    type='checkbox'
                    defaultChecked={checked}
                    label={name}
                    onClick={this.feedsUpdated.bind(this)}
                  />
                }) : 'Cannot fetch feeds'
              }
              </Col>
              <Col xs={6}>
                <h4>Permissions</h4>
                {allPermissions.map((permission, i) => {
                  let ref = 'permission-' + permission.type
                  let checked = this.props.settings.permissions.indexOf(permission.type) !== -1
                  return <Input
                    ref={ref}
                    type='checkbox'
                    defaultChecked={checked}
                    label={permission.name}
                    onClick={this.permissionsUpdated.bind(this)}
                  />
                })}
              </Col>
            </Row>
          ) : ''}
        </Col>
      </Row>
    )
  }
}
