import React, { Component, PropTypes } from 'react'
import { Row, Col, Checkbox, Panel, SplitButton, MenuItem, Label, ButtonGroup, Button } from 'react-bootstrap'
import update from 'react-addons-update'
import Select from 'react-select'

import allPermissions from './permissions'
import { getComponentMessages, getMessage } from '../../common/util/config'

export default class UserSettings extends Component {
  static propTypes = {
    creatingUser: PropTypes.object,
    fetchProjectFeeds: PropTypes.func,
    isCreating: PropTypes.bool,
    organizations: PropTypes.array,
    permissions: PropTypes.object,
    projects: PropTypes.array
  }
  constructor (props) {
    super(props)
    this.state = {
      appAdminChecked: this.props.permissions.isApplicationAdmin(),
      currentProjectIndex: 0,
      projectSettings: {},
      organization: null
    }

    this.props.organizations.forEach((organization, i) => {
      if (this.props.permissions.hasOrganization(organization.id)) {
        this.state.organization = organization
        if (this.props.permissions.isOrganizationAdmin(organization.id)) {
          this.state.orgAdminChecked = true
        }
      } else if (this.props.isCreating && this.props.creatingUser.permissions.getOrganizationId() === organization.id) {
        this.state.organization = organization
      }
    })
    this.props.projects.forEach((project, i) => {
      let access = 'none'
      let defaultFeeds = []
      let permissions = []
      if (this.props.permissions.hasProject(project.id, project.organizationId)) {
        if (this.props.permissions.isProjectAdmin(project.id, project.organizationId)) {
          access = 'admin'
        } else {
          access = 'custom'
          const projectPermissions = this.props.permissions.getProjectPermissions(project.id)
          permissions = projectPermissions.map((p) => { return p.type })
          defaultFeeds = this.props.permissions.getProjectDefaultFeeds(project.id)
        }
      }
      this.state.projectSettings[project.id] = { access, defaultFeeds, permissions }
    })
  }
  getSettings () {
    if (this.state.appAdminChecked) {
      return {
        permissions: [{
          type: 'administer-application'
        }],
        projects: [],
        client_id: process.env.AUTH0_CLIENT_ID
      }
    }

    const settings = {
      permissions: [],
      projects: [],
      organizations: [],
      client_id: process.env.AUTH0_CLIENT_ID
    }
    if (this.state.organization) {
      const orgSettings = {
        organization_id: this.state.organization.id,
        permissions: this.state.orgAdminChecked
          ? [{type: 'administer-organization'}] // this.state.orgPermissions[this.state.organization.id]
          : []
      }
      settings.organizations.push(orgSettings)
    }
    this.props.projects.forEach((project, i) => {
      const stateProjectSettings = this.state.projectSettings[project.id]
      if (stateProjectSettings.access === 'none') return

      const projectSettings = {
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
    this.setState({
      currentProjectIndex: key
    })
  }

  appAdminClicked (value) {
    const stateUpdate = {
      appAdminChecked: value
    }
    if (value) {
      stateUpdate.organization = null
      stateUpdate.orgAdminChecked = false
    }
    this.setState(stateUpdate)
  }

  orgAdminClicked (value, projects, org) {
    this.setState({orgAdminChecked: value})
  }
  orgUpdated = (val) => {
    const stateUpdate = {
      organization: (val && val.organization) || null,
      orgAdminChecked: false,
      projectSettings: {}
    }
    this.props.projects.forEach(p => {
      const access = 'none'
      const defaultFeeds = []
      const permissions = []
      stateUpdate.projectSettings[p.id] = {access, defaultFeeds, permissions}
    })
    this.setState(stateUpdate)
  }
  projectAccessUpdated (projectId, newAccess) {
    var stateUpdate = {projectSettings: {[projectId]: {$merge: {access: newAccess}}}}
    console.log(stateUpdate)
    this.setState(update(this.state, stateUpdate))
  }

  projectFeedsUpdated (projectId, newFeeds) {
    var stateUpdate = {projectSettings: {[projectId]: {$merge: {defaultFeeds: newFeeds}}}}
    this.setState(update(this.state, stateUpdate))
  }

  projectPermissionsUpdated (projectId, newPermissions) {
    var stateUpdate = {projectSettings: {[projectId]: {$merge: {permissions: newPermissions}}}}
    this.setState(update(this.state, stateUpdate))
  }

  render () {
    const messages = getComponentMessages('UserSettings')
    const { creatingUser, fetchProjectFeeds, organizations, projects } = this.props
    const orgToOption = organization => ({label: organization.name, value: organization.id, organization})
    const creatorIsApplicationAdmin = creatingUser.permissions.isApplicationAdmin()

    // limit available projects to those that either have no org or match the current state org
    const orgProjects = projects.filter(p => !p.organizationId || (this.state.organization && this.state.organization.id === p.organizationId))
    const currentProject = orgProjects[this.state.currentProjectIndex]

    const getProjectLabel = (access) => {
      switch (access) {
        case 'none': return <Label>{getMessage(messages, 'project.noAccess')}</Label>
        case 'admin': return <Label bsStyle='primary'>{getMessage(messages, 'project.admin')}</Label>
        case 'custom': return <Label bsStyle='success'>{getMessage(messages, 'project.custom')}</Label>
      }
    }

    const projectPanel = (
      <Panel
        header={
          <h3>
            Project Settings for{' '}
            <SplitButton
              disabled={!currentProject}
              title={currentProject ? currentProject.name : 'No projects available'}
              id={currentProject ? currentProject.name : 'No projects available'}
              onSelect={(key) => this.projectSelected(key)}
            >
              {orgProjects.map((project, i) => {
                const settings = this.state.projectSettings[project.id]
                if (settings) {
                  return <MenuItem key={project.id} eventKey={i}>{project.name} {getProjectLabel(settings.access)}</MenuItem>
                }
              })}
            </SplitButton>
          </h3>
        }
      >
        {orgProjects.map((project, i) => {
          if (i !== this.state.currentProjectIndex) return null
          const settings = this.state.projectSettings[project.id]
          return <ProjectSettings
            project={project}
            key={project.id}
            settings={settings}
            fetchProjectFeeds={fetchProjectFeeds}
            visible={(i === this.state.currentProjectIndex)}
            projectAccessUpdated={this.projectAccessUpdated.bind(this)}
            projectFeedsUpdated={this.projectFeedsUpdated.bind(this)}
            projectPermissionsUpdated={this.projectPermissionsUpdated.bind(this)}
          />
        })}
      </Panel>
  )

    return (
      <Row>
        <Col xs={4}>
          <Panel header={
            <h3>
              Organization settings
              {
                // getMessage(messages, 'application')
              }
            </h3>
          }>
            {creatorIsApplicationAdmin &&
              <Checkbox
                checked={this.state.appAdminChecked}
                onChange={(evt) => this.appAdminClicked(evt.target.checked)}
                ref='appAdminCheckbox'
              >
                {getMessage(messages, 'admin.title')}
              </Checkbox>
            }
            {/* Organizations selector. Only show if there exist organizations already. */}
            {!this.state.appAdminChecked && organizations && organizations.length
              ? <div className='orgDetails'>
                <Select
                  options={organizations.map(orgToOption)}
                  placeholder='Choose organization...'
                  disabled={!creatorIsApplicationAdmin}
                  value={this.state.organization && orgToOption(this.state.organization)}
                  onChange={this.orgUpdated}
                />
                {this.state.organization &&
                  <Checkbox
                    checked={this.state.orgAdminChecked}
                    onChange={(evt) => this.orgAdminClicked(evt.target.checked, orgProjects, this.state.organization)}
                    ref='orgAdminCheckbox'
                  >
                    {getMessage(messages, 'org.admin')}
                  </Checkbox>
                }
              </div>
              : null
            }
          </Panel>
        </Col>
        <Col xs={8}>
          {this.state.appAdminChecked
            ? <i>{getMessage(messages, 'admin.description')}</i>
            : this.state.orgAdminChecked
            ? <i>{getMessage(messages, 'org.description')}</i>
            : projectPanel
          }
        </Col>
      </Row>
    )
  }
}

class ProjectSettings extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectSettings: this.props.settings
    }
  }
  static propTypes = {
    project: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    visible: PropTypes.bool,

    fetchProjectFeeds: PropTypes.func,
    projectAccessUpdated: PropTypes.func,
    projectFeedsUpdated: PropTypes.func,
    projectPermissionsUpdated: PropTypes.func
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
    const selectedFeeds = []
    this.props.project.feedSources.forEach((feed) => {
      var checkbox = this['feed-' + feed.id]
      if (checkbox.checked) selectedFeeds.push(feed.id)
    })
    this.props.projectFeedsUpdated(this.props.project.id, selectedFeeds)
  }
  permissionsUpdated () {
    const selectedPermissions = []
    allPermissions.forEach((permission) => {
      var checkbox = this['permission-' + permission.type]
      if (checkbox.checked) selectedPermissions.push(permission.type)
    })
    this.props.projectPermissionsUpdated(this.props.project.id, selectedPermissions)
  }
  render () {
    const {
      project,
      visible,
      settings
    } = this.props
    const messages = getComponentMessages('UserSettings')

    let feedSources = project.feedSources
    if (feedSources) {
      feedSources = feedSources.slice(0).sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
    return (
      <Row style={{display: visible ? 'block' : 'none'}}>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <ButtonGroup>
                <Button
                  active={settings.access === 'none'}
                  onClick={this.setAccess.bind(this, 'none')}
                >
                  {getMessage(messages, 'project.noAccess')}
                </Button>

                <Button
                  active={settings.access === 'admin'}
                  onClick={this.setAccess.bind(this, 'admin')}
                >
                  {getMessage(messages, 'project.admin')}
                </Button>

                <Button
                  active={settings.access === 'custom'}
                  onClick={this.setAccess.bind(this, 'custom')}
                >
                  {getMessage(messages, 'project.custom')}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          {settings.access === 'custom' ? (
            <Row>
              <Col xs={6}>
                <h4>{getMessage(messages, 'project.feeds')}</h4>
                {feedSources
                  ? feedSources.map((feed, i) => {
                    const name = (feed.name === '') ? '(unnamed feed)' : feed.name
                    const refName = 'feed-' + feed.id
                    const checked = settings.defaultFeeds.indexOf(feed.id) !== -1
                    return <Checkbox
                      inputRef={ref => { this[refName] = ref }}
                      key={feed.id}
                      checked={checked}
                      onChange={() => this.feedsUpdated()}
                    >
                      {name}
                    </Checkbox>
                  })
                  : getMessage(messages, 'project.cannotFetchFeeds')
              }
              </Col>
              <Col xs={6}>
                <h4>{getMessage(messages, 'project.permissions')}</h4>
                {allPermissions.map((permission, i) => {
                  const refName = 'permission-' + permission.type
                  const checked = settings.permissions.indexOf(permission.type) !== -1
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
