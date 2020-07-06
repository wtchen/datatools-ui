// @flow

import React, {Component} from 'react'
import {
  Col,
  ListGroup,
  ListGroupItem,
  Panel,
  Row
} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import * as feedsActions from '../actions/feeds'
import toSentenceCase from '../../common/util/to-sentence-case'
import ExternalPropertiesTable from './ExternalPropertiesTable'
import FeedTransformationSettings from './FeedTransformationSettings'
import GeneralSettings from './GeneralSettings'

import type {Feed, Project} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = {
  activeComponent: string,
  activeSubComponent: string,
  confirmDeleteFeedSource: () => void,
  feedSource: Feed,
  project: Project,
  updateExternalFeedResource: typeof feedsActions.updateExternalFeedResource,
  updateFeedSource: typeof feedsActions.updateFeedSource,
  user: ManagerUserState
}

export default class FeedSourceSettings extends Component<Props> {
  render () {
    const {
      activeComponent,
      activeSubComponent,
      updateExternalFeedResource,
      feedSource,
      project,
      user
    } = this.props
    const disabled = user.permissions && !user.permissions.hasFeedPermission(
      project.organizationId, project.id, feedSource.id, 'manage-feed'
    )
    const isProjectAdmin = user.permissions && user.permissions.isProjectAdmin(
      project.id, project.organizationId
    )
    const resourceType = activeComponent === 'settings' && activeSubComponent && activeSubComponent.toUpperCase()
    const showTransformationsTab = resourceType === 'TRANSFORMATIONS'
    if (disabled) {
      return (
        <Row>
          <Col xs={6} mdOffset={3}>
            <p className='lead text-center'><strong>Warning!</strong> You do not have permission to edit details for this feed source.</p>
          </Col>
        </Row>
      )
    }
    return (
      <Row>
        <Col xs={3}>
          {/* Side panel */}
          <Panel>
            <ListGroup fill>
              <LinkContainer
                to={`/feed/${feedSource.id}/settings`}
                active={!activeSubComponent}>
                <ListGroupItem>General</ListGroupItem>
              </LinkContainer>
              <LinkContainer
                to={`/feed/${feedSource.id}/settings/transformations`}
                active={showTransformationsTab}>
                <ListGroupItem>Feed Transformations</ListGroupItem>
              </LinkContainer>
              {Object.keys(feedSource.externalProperties || {}).map(resourceType => {
                const resourceLowerCase = resourceType.toLowerCase()
                return (
                  <LinkContainer
                    key={resourceType}
                    to={`/feed/${feedSource.id}/settings/${resourceLowerCase}`}
                    active={activeSubComponent === resourceLowerCase}>
                    <ListGroupItem>{toSentenceCase(resourceType)} properties</ListGroupItem>
                  </LinkContainer>
                )
              })}
            </ListGroup>
          </Panel>
        </Col>
        <Col xs={6} />
        {!resourceType
          ? <GeneralSettings
            confirmDeleteFeedSource={this.props.confirmDeleteFeedSource}
            disabled={disabled}
            feedSource={feedSource}
            project={project}
            updateFeedSource={this.props.updateFeedSource}
            user={user}
          />
          : showTransformationsTab
            // FIXME: Remove props spread.
            ? <FeedTransformationSettings
              disabled={disabled}
              feedSource={feedSource}
              project={project}
              updateFeedSource={this.props.updateFeedSource}
              user={user}
             />
            : <Col xs={7}>
              <ExternalPropertiesTable
                resourceType={resourceType}
                feedSource={feedSource}
                editingIsDisabled={disabled}
                isProjectAdmin={isProjectAdmin}
                resourceProps={feedSource.externalProperties
                  ? feedSource.externalProperties[resourceType]
                  : {}
                }
                updateExternalFeedResource={updateExternalFeedResource} />
            </Col>
        }
      </Row>
    )
  }
}
