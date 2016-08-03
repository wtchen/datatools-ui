import React from 'react'
import { Row, Col, Checkbox, Panel, SplitButton, MenuItem, Label, ButtonGroup, Button } from 'react-bootstrap'
import update from 'react-addons-update'
import ReactDOM from 'react-dom'

import allPermissions from './permissions'
import { getComponentMessages, getConfigProperty } from '../../common/util/config'

export default class UserSettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      appAdminChecked: this.props.permissions.isApplicationAdmin(),
      currentProjectIndex: 0,
      projectSettings: {},
    }

    this.props.projects.forEach((project, i) => {
      let access = 'none'
      let defaultFeeds = []
      let permissions = []
      if(this.props.permissions.hasProject(project.id)) {
        if(this.props.permissions.isProjectAdmin(project.id)) {
          access = 'admin'
        }
        else {
          access = 'custom'
          let projectPermissions = this.props.permissions.getProjectPermissions(project.id)
          permissions = projectPermissions.map((p) => { return p.type })
          defaultFeeds = this.props.permissions.getProjectDefaultFeeds(project.id)
        }
      }
      this.state.projectSettings[project.id] = { access, defaultFeeds, permissions }
    })
  }

  getSettings () {
    if(this.state.appAdminChecked) {
      return {
        permissions: [{
          type: 'administer-application'
        }],
        projects: [],
        client_id: getConfigProperty('auth0.client_id')
      }
    }

    let settings = {
      permissions: [],
      projects: [],
      client_id: getConfigProperty('auth0.client_id')
    }

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

  projectSelected (key) {
    let currentProject = this.props.projects[key]
    this.setState({
      currentProjectIndex: key
    })
  }

  appAdminClicked (value) {
    console.log(ReactDOM.findDOMNode(this.refs.appAdminCheckbox))
    this.setState({
      appAdminChecked: value
    })
  }

  projectAccessUpdated (projectId, newAccess) {
    var stateUpdate = { projectSettings: { [projectId]: { $merge : { access : newAccess } } } }
    this.setState(update(this.state, stateUpdate))
  }

  projectFeedsUpdated (projectId, newFeeds) {
    var stateUpdate = { projectSettings: { [projectId]: { $merge : { defaultFeeds : newFeeds } } } }
    this.setState(update(this.state, stateUpdate))
  }

  projectPermissionsUpdated (projectId, newPermissions) {
    var stateUpdate = { projectSettings: { [projectId]: { $merge : { permissions : newPermissions } } } }
    this.setState(update(this.state, stateUpdate))
  }

  render () {
    const messages = getComponentMessages('UserSettings')
    let currentProject = this.props.projects[this.state.currentProjectIndex]

    const getProjectLabel = (access) => {
      switch(access) {
        case 'none': return <Label>{messages.project.noAccess}</Label>
        case 'admin': return <Label bsStyle='primary'>{messages.project.admin}</Label>
        case 'custom': return <Label bsStyle='success'>{messages.project.custom}</Label>
      }
    }

    let projectPanel = (
      <Panel header={
        <h3>
          Project Settings for&nbsp;
          <SplitButton
            title={currentProject.name}
            id={currentProject.name}
            onSelect={(key) => this.projectSelected(key)}

          >
            {this.props.projects.map((project, i) => {
              let settings = this.state.projectSettings[project.id]
              if (typeof settings !== 'undefined')
                return <MenuItem key={project.id} eventKey={i}>{project.name} {getProjectLabel(settings.access)}</MenuItem>
            })}
          </SplitButton>
        </h3>
      }
      >
      <div></div>
      {this.props.projects.map((project, i) => {
        let settings = this.state.projectSettings[project.id]
        return <ProjectSettings
          project={project}
          key={project.id}
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
          <Panel header={<h3>{messages.application}</h3>}>
            <Checkbox
              checked={this.state.appAdminChecked}
              onChange={(evt) => this.appAdminClicked(evt.target.checked)}
              ref='appAdminCheckbox'
            >
              {messages.admin.title}
            </Checkbox>
          </Panel>
        </Col>
        <Col xs={8}>
          {this.state.appAdminChecked
            ? <i>{messages.admin.description}</i>
            : projectPanel
          }
        </Col>
      </Row>
    )
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
  refCallback (ref) {
    this.inputRef = ref
  }
  feedsUpdated () {
    let selectedFeeds = []
    this.props.project.feedSources.forEach((feed) => {
      var checkbox = this['feed-' + feed.id]
      if(checkbox.checked) selectedFeeds.push(feed.id)
    })
    this.props.projectFeedsUpdated(this.props.project.id, selectedFeeds)
  }

  permissionsUpdated () {
    let selectedPermissions = []
    allPermissions.forEach((permission) => {
      var checkbox = this['permission-' + permission.type]
      if(checkbox.checked) selectedPermissions.push(permission.type)
    })
    this.props.projectPermissionsUpdated(this.props.project.id, selectedPermissions)
  }

  render () {
    let lookup = {}
    const messages = getComponentMessages('UserSettings')

    let feedSources = this.props.project.feedSources
    if (feedSources) {
      feedSources = feedSources.slice(0).sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }

    return (
      <Row style={{display: this.props.visible ? 'block' : 'none'}}>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <ButtonGroup>
                <Button
                  active={this.props.settings.access === 'none'}
                  onClick={this.setAccess.bind(this, 'none')}
                >{messages.project.noAccess}</Button>

                <Button
                  active={this.props.settings.access === 'admin'}
                  onClick={this.setAccess.bind(this, 'admin')}
                >{messages.project.admin}</Button>

                <Button
                  active={this.props.settings.access === 'custom'}
                  onClick={this.setAccess.bind(this, 'custom')}
                >{messages.project.custom}</Button>
              </ButtonGroup>
            </Col>
          </Row>
          {this.props.settings.access === 'custom' ? (
            <Row>
              <Col xs={6}>
                <h4>{messages.project.feeds}</h4>
                {feedSources
                  ? feedSources.map((feed, i) => {
                    let name = (feed.name === '') ? '(unnamed feed)' : feed.name
                    let refName = 'feed-' + feed.id
                    let checked = this.props.settings.defaultFeeds.indexOf(feed.id) !== -1
                    return <Checkbox
                      inputRef={ref => { this[refName] = ref }}
                      key={feed.id}
                      checked={checked}
                      onChange={() => this.feedsUpdated()}
                    >
                      {name}
                    </Checkbox>
                  })
                  : messages.project.cannotFetchFeeds
              }
              </Col>
              <Col xs={6}>
                <h4>{messages.project.permissions}</h4>
                {allPermissions.map((permission, i) => {
                  let refName = 'permission-' + permission.type
                  let checked = this.props.settings.permissions.indexOf(permission.type) !== -1
                  return <Checkbox
                    inputRef={ref => { this[refName] = ref }}
                    key={permission.type}
                    checked={checked}
                    onChange={() => this.permissionsUpdated()}
                  >
                    {permission.name}
                  </Checkbox>
                })}
              </Col>
            </Row>
          ) : ''}
        </Col>
      </Row>
    )
  }
}
