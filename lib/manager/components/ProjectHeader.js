// @flow

import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {ButtonToolbar, Col, Row} from 'react-bootstrap'
import {Link} from 'react-router'

import WatchButton from '../../common/containers/WatchButton'
import {getConfigProperty} from '../../common/util/config'

import type {Project, User} from '../../types'

type Props = {
  project: Project,
  user: User
}

export default class ProjectHeader extends Component {
  props: Props

  render () {
    const {project, user} = this.props
    const isWatchingProject = user.subscriptions.hasProjectSubscription(
      project.id,
      'project-updated'
    )
    return (
      <Row className='project-header'>
        <Col xs={12}>
          <h3>
            <Icon className='icon-link' type='folder-open-o' />
            <Link to={`/project/${project.id}`}>{project.name}</Link>
            <ButtonToolbar className={`pull-right`}>
              {getConfigProperty('application.notifications_enabled') ? (
                <WatchButton
                  isWatching={isWatchingProject}
                  user={user}
                  target={project.id}
                  subscriptionType='project-updated'
                />
              ) : null}
            </ButtonToolbar>
          </h3>
          <ul
            className='list-unstyled list-inline small'
            style={{marginBottom: '0px'}}
          >
            <li>
              <Icon type='map-marker' />{' '}
              {project.defaultLocationLat && project.defaultLocationLon
                ? `${project.defaultLocationLat}, ${project.defaultLocationLon}`
                : 'n/a'}
            </li>
            <li>
              <Icon type='cloud-download' />{' '}
              {project.autoFetchFeeds && project.autoFetchHour && project.autoFetchMinute
                ? `${project.autoFetchHour}:${project.autoFetchMinute < 10
                    ? '0' + project.autoFetchMinute
                    : project.autoFetchMinute}`
                : 'Auto fetch disabled'}
            </li>
            {/* <li><Icon type='file-archive-o' /> {fs.feedVersions ? `${this.getAverageFileSize(fs.feedVersions)} MB` : 'n/a'}</li> */}
          </ul>
        </Col>
      </Row>
    )
  }
}
