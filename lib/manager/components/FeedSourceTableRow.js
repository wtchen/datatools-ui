// @flow

import Icon from '@conveyal/woonerf/components/icon'
import humanizeDuration from 'humanize-duration'
import moment from 'moment'
import React, {PureComponent} from 'react'
import {
  Col,
  DropdownButton,
  Glyphicon,
  MenuItem,
  Row
} from 'react-bootstrap'
import {browserHistory, Link} from 'react-router'

import * as deploymentActions from '../actions/deployments'
import * as feedsActions from '../actions/feeds'
import * as versionsActions from '../actions/versions'
import {
  getComponentMessages,
  isModuleEnabled,
  getConfigProperty
} from '../../common/util/config'
import {abbreviate, isValidZipFile} from '../../common/util/util'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import WatchButton from '../../common/containers/WatchButton'
import {getVersionStatus} from '../util/version'

import type {Props as ContainerProps} from '../containers/FeedSourceTableRow'
import type {Feed} from '../../types'
import type {ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  createDeploymentFromFeedSource: typeof deploymentActions.createDeploymentFromFeedSource,
  createFeedSource: typeof feedsActions.createFeedSource,
  deleteFeedSource: typeof feedsActions.deleteFeedSource,
  feedSource: Feed,
  runFetchFeed: typeof feedsActions.runFetchFeed,
  updateFeedSource: typeof feedsActions.updateFeedSource,
  uploadFeed: typeof versionsActions.uploadFeed,
  user: ManagerUserState
}

const dateFormat = 'MMM D, YYYY'

const statusAttributeLookup = {
  'active': {
    className: 'status-active',
    icon: 'check-circle'
  },
  'expiring-within-20-days': {
    className: 'status-expiring-20',
    icon: 'exclamation-triangle'
  },
  'expiring-within-5-days': {
    className: 'status-expiring-5',
    icon: 'exclamation-triangle'
  },
  'expired': {
    className: 'status-expired',
    icon: 'times-circle'
  },
  'future': {
    className: 'status-future',
    icon: 'clock-o'
  },
  'no-version': {
    className: 'status-no-version',
    icon: 'minus-circle'
  }
}

export default class FeedSourceTableRow extends PureComponent<Props> {
  messages = getComponentMessages('FeedSourceTableRow')

  _onClickDelete = () => {
    // Delete immediately if feed source is being created.
    if (this.props.feedSource.isCreating) return this._onConfirmDelete()
    // Otherwise, show delete modal.
    this.refs.deleteModal.open()
  }

  _onClickDeploy = () => {
    const {createDeploymentFromFeedSource, feedSource} = this.props
    createDeploymentFromFeedSource(feedSource)
  }

  _onClickEdit = () => browserHistory.push(`/feed/${this.props.feedSource.id}/edit/`)

  _onClickFetch = () => {
    const {feedSource, runFetchFeed} = this.props
    runFetchFeed(feedSource)
  }

  _onClickPublic = () => {
    browserHistory.push(`/public/feed/${this.props.feedSource.id}`)
  }

  _onClickUpload = () => { this.refs.uploadModal.open() }

  _onConfirmDelete = () => {
    this.props.deleteFeedSource(this.props.feedSource)
  }

  _onConfirmUpload = (files: Array<File>) => {
    const {feedSource, uploadFeed} = this.props
    const file = files[0]
    if (isValidZipFile(file)) {
      uploadFeed(feedSource, file)
      return true
    } else {
      return false
    }
  }

  render () {
    const {
      feedSource,
      user,
      project
    } = this.props
    const {permissions, subscriptions} = user
    const disabled = !permissions ||
      !permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'manage-feed')
    const isWatchingFeed = subscriptions &&
      subscriptions.hasFeedSubscription(project.id, feedSource.id, 'feed-updated')
    const editGtfsDisabled = !permissions ||
      !permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'edit-gtfs')

    const shouldRenderComparisonColumn = false

    let errorCount, validDates
    let currentVersionStatus: string
    if (feedSource.latestValidation) {
      const validation = feedSource.latestValidation
      errorCount = validation.errorCount || 'None'
      const endMoment = moment(validation.endDate)
      const startMoment = moment(validation.startDate)
      currentVersionStatus = getVersionStatus(startMoment, endMoment)
      validDates = `${startMoment.format(dateFormat)} - ${endMoment.format(dateFormat)}`
    } else {
      currentVersionStatus = 'no-version'
    }

    const currentVersionData = statusAttributeLookup[currentVersionStatus]
    let lastVersionUpdate = feedSource.lastUpdated && humanizeDuration(
      (moment().unix() - moment(feedSource.lastUpdated).unix()) * 1000,
      { largest: 1 }
    )
    lastVersionUpdate = lastVersionUpdate && `Last updated ${lastVersionUpdate} ago`

    return (
      <tr key={feedSource.id} className='feed-source-table-row'>
        <ConfirmModal
          ref='deleteModal'
          title='Delete Feed Source?'
          body={`Are you sure you want to delete the feed source ${feedSource.name}?`}
          onConfirm={this._onConfirmDelete}
        />
        <SelectFileModal
          ref='uploadModal'
          title='Upload Feed'
          body='Select a GTFS feed to upload:'
          onConfirm={this._onConfirmUpload}
          errorMessage='Uploaded file must be a valid zip file (.zip).'
        />
        <td className='feed-source-info'>
          <FeedInfo feedSource={feedSource} />
        </td>
        {shouldRenderComparisonColumn && <td>Compare to</td>}
        <td className='feed-version-column'>
          <span className={`feed-status ${currentVersionData.className}`}>
            <Icon type={currentVersionData.icon} />
            {this.messages(`status.${currentVersionStatus}`)}
          </span>
          <div className='feed-status-last-update'>
            {lastVersionUpdate}
          </div>
        </td>
        <td className='feed-version-column'>{validDates}</td>
        <td className='feed-version-column'>{errorCount}</td>
        <td>
          <DropdownButton
            id={`feed-source-action-button-${feedSource.id}`}
            title='Menu'
          >
            <MenuItem
              disabled={editGtfsDisabled}
              onClick={this._onClickEdit}
            >
              <Glyphicon glyph='pencil' /> Open in Editor
            </MenuItem>
            <MenuItem
              disabled={disabled || !feedSource.url}
              onClick={this._onClickFetch}
            >
              <Glyphicon glyph='refresh' /> Fetch
            </MenuItem>
            <MenuItem
              disabled={disabled}
              onClick={this._onClickUpload}
            >
              <Glyphicon glyph='upload' /> Upload
            </MenuItem>
            {/* show divider only if deployments and notifications are enabled (otherwise, we don't need it) */}
            {isModuleEnabled('deployment') || getConfigProperty('application.notifications_enabled')
              ? <MenuItem divider />
              : null
            }
            {isModuleEnabled('deployment')
              ? <MenuItem
                disabled={disabled || !feedSource.deployable || !feedSource.latestValidation}
                title={disabled
                  ? 'You do not have permission to deploy feed'
                  : !feedSource.deployable
                    ? 'Feed source is not deployable. Change in feed source settings.'
                    : !feedSource.latestValidation
                      ? 'No versions exist. Create new version to deploy feed'
                      : 'Deploy feed source.'
                }
                onClick={this._onClickDeploy}
              >
                <Glyphicon glyph='globe' /> Deploy
              </MenuItem>
              : null
            }
            {getConfigProperty('application.notifications_enabled')
              ? <WatchButton
                isWatching={isWatchingFeed}
                user={user}
                target={feedSource.id}
                subscriptionType='feed-updated'
                componentClass='menuItem' />
              : null
            }
            <MenuItem
              disabled={!feedSource.isPublic}
              onClick={this._onClickPublic}
            >
              <Glyphicon glyph='link' /> View public page
            </MenuItem>
            <MenuItem divider />
            <MenuItem
              data-test-id='feed-source-dropdown-delete-feed-source-button'
              disabled={disabled}
              onClick={this._onClickDelete}
            >
              <Icon type='trash' /> Delete
            </MenuItem>
          </DropdownButton>
        </td>
      </tr>
    )
  }
}

class FeedInfo extends PureComponent<{ feedSource: Feed }> {
  render () {
    const {feedSource} = this.props

    const lastUpdateText = feedSource.lastUpdated
      ? `Last updated ${moment(feedSource.lastUpdated).format(dateFormat)}`
      : 'No updates yet'

    return (
      <div>
        <h4>
          <Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link>
        </h4>
        <h5>{lastUpdateText}</h5>
        <Row>
          {feedSource.url &&
            <Col xs={12}>
              <Icon type='link' />
              <a href={feedSource.url} target='_blank'>
                {abbreviate(feedSource.url)}
                <Icon type='external-link' />
              </a>
            </Col>
          }
          {feedSource.retrievalMethod === 'FETCHED_AUTOMATICALLY' &&
            <Col xs={6}>
              <Icon type='feed' />
              Auto fetch
            </Col>
          }
          {feedSource.deployable &&
            <Col xs={6}>
              <Icon type='rocket' />
              Deployable
            </Col>
          }
          <Col xs={6}>
            <Icon type={feedSource.isPublic ? 'globe' : 'lock'} />
            {feedSource.isPublic ? 'Public' : 'Private'}
          </Col>
        </Row>
      </div>
    )
  }
}
