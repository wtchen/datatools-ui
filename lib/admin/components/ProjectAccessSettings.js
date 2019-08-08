// @flow

import React, {Component} from 'react'
import {Row, Col, Checkbox, ButtonGroup} from 'react-bootstrap'

import OptionButton from '../../common/components/OptionButton'
import {getComponentMessages} from '../../common/util/config'
import * as feedActions from '../../manager/actions/feeds'
import allPermissions from './permissions'

import type {Project} from '../../types'

type ProjectSettingsType = {
  access: string,
  defaultFeeds: Array<string>,
  permissions: Array<string>
}

type Props = {
  fetchProjectFeeds: typeof feedActions.fetchProjectFeeds,
  project: Project,
  projectAccessUpdated: (string, string) => void,
  projectFeedsUpdated: (string, Array<string>) => void,
  projectPermissionsUpdated: (string, Array<string>) => void,
  settings: ProjectSettingsType,
  visible: boolean
}

type State = {
  projectSettings: ProjectSettingsType
}

const ACCESS_TYPES = [{
  type: 'none',
  message: 'noAccess'
}, {
  type: 'admin',
  message: 'admin'
}, {
  type: 'custom',
  message: 'custom'
}]

export default class ProjectAccessSettings extends Component<Props, State> {
  messages = getComponentMessages('ProjectAccessSettings')

  componentWillMount () {
    this.setState({
      projectSettings: this.props.settings
    })
    if (!this.props.project.feedSources) {
      this.props.fetchProjectFeeds(this.props.project.id)
    }
  }

  setAccess = (access: string) => {
    this.props.projectAccessUpdated(this.props.project.id, access)
  }

  feedsUpdated = () => {
    const {project, projectFeedsUpdated} = this.props
    const selectedFeeds = []
    if (project.feedSources) {
      project.feedSources.forEach((feed) => {
        // $FlowFixMe
        var checkbox = this[`feed-${feed.id}`]
        if (checkbox.checked) selectedFeeds.push(feed.id)
      })
    }
    projectFeedsUpdated(project.id, selectedFeeds)
  }

  permissionsUpdated = () => {
    const selectedPermissions = []
    allPermissions.forEach((permission) => {
      // $FlowFixMe
      var checkbox = this[`permission-${permission.type}`]
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
    let feedSources = project.feedSources
    if (feedSources) {
      feedSources = feedSources.slice(0).sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
    return (
      <Row style={{ display: visible ? 'block' : 'none' }}>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <ButtonGroup>
                {ACCESS_TYPES.map(a => (
                  <OptionButton
                    active={settings.access === a.type}
                    key={a.type}
                    onClick={this.setAccess}
                    value={a.type}>
                    {this.messages(`${a.message}`)}
                  </OptionButton>
                ))}
              </ButtonGroup>
            </Col>
          </Row>
          {settings.access === 'custom'
            ? <Row>
              <Col xs={6}>
                <h4>{this.messages('feeds')}</h4>
                {feedSources
                  ? feedSources.map((feed, i) => (
                    <Checkbox
                      // $FlowFixMe
                      inputRef={ref => { this[`feed-${feed.id}`] = ref }}
                      key={feed.id}
                      checked={settings.defaultFeeds.indexOf(feed.id) !== -1}
                      onChange={this.feedsUpdated}>
                      {feed.name === '' ? '(unnamed feed)' : feed.name}
                    </Checkbox>
                  ))
                  : this.messages('cannotFetchFeeds')
                }
              </Col>
              <Col xs={6}>
                <h4>{this.messages('permissions')}</h4>
                {allPermissions.map((permission, i) => (
                  <Checkbox
                    // $FlowFixMe
                    inputRef={ref => { this[`permission-${permission.type}`] = ref }}
                    key={permission.type}
                    checked={settings.permissions.indexOf(permission.type) !== -1}
                    onChange={this.permissionsUpdated}>
                    {permission.name}
                  </Checkbox>
                ))}
              </Col>
            </Row>
            : ''
          }
        </Col>
      </Row>
    )
  }
}
