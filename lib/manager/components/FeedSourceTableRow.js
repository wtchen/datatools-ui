// @flow

import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, {PureComponent} from 'react'
import {
  Button,
  Col,
  Dropdown,
  Glyphicon,
  ListGroupItem,
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
import {isValidZipFile} from '../../common/util/util'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import WatchButton from '../../common/containers/WatchButton'

import type {Props as ContainerProps} from '../containers/FeedSourceTableRow'
import type {Feed, RetrievalMethod, ValidationSummary} from '../../types'
import type {FeedSourceTableFilterStrategies, FeedTableViewType, ManagerUserState} from '../../types/reducers'

type Props = ContainerProps & {
  createDeploymentFromFeedSource: typeof deploymentActions.createDeploymentFromFeedSource,
  createFeedSource: typeof feedsActions.createFeedSource,
  deleteFeedSource: typeof feedsActions.deleteFeedSource,
  feedSource: Feed,
  feedTableViewType: FeedTableViewType,
  runFetchFeed: typeof feedsActions.runFetchFeed,
  updateFeedSource: typeof feedsActions.updateFeedSource,
  uploadFeed: typeof versionsActions.uploadFeed,
  user: ManagerUserState
}

const dateFormat = 'YYYY-MM-DD'

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
  _selectItem = (key: string) => {
    const {
      createDeploymentFromFeedSource,
      feedSource,
      runFetchFeed
    } = this.props
    switch (key) {
      case 'delete':
        return this.deleteFeed()
      case 'fetch':
        return runFetchFeed(feedSource)
      case 'upload':
        return this._uploadFeed()
      case 'deploy':
        return createDeploymentFromFeedSource(feedSource)
      case 'public':
        return browserHistory.push(`/public/feed/${feedSource.id}`)
    }
  }

  deleteFeed () {
    // Delete immediately if feed source is being created.
    if (this.props.feedSource.isCreating) return this._onDelete()
    // Otherwise, show delete modal.
    this.refs.deleteModal.open()
  }

  _uploadFeed () {
    this.refs.uploadModal.open()
  }

  confirmUpload = (files: Array<File>) => {
    const {feedSource, uploadFeed} = this.props
    const file = files[0]
    if (isValidZipFile(file)) {
      uploadFeed(feedSource, file)
      return true
    } else {
      return false
    }
  }

  _onClickEdit = () => browserHistory.push(`/feed/${this.props.feedSource.id}/edit/`)

  _onDelete = () => {
    this.props.deleteFeedSource(this.props.feedSource)
  }

  render () {
    const {
      feedSource,
      feedTableViewType,
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

    return (
      <ListGroupItem key={feedSource.id} >
        <ConfirmModal
          ref='deleteModal'
          title='Delete Feed Source?'
          body={`Are you sure you want to delete the feed source ${feedSource.name}?`}
          onConfirm={this._onDelete}
        />
        <SelectFileModal
          ref='uploadModal'
          title='Upload Feed'
          body='Select a GTFS feed to upload:'
          onConfirm={this.confirmUpload}
          errorMessage='Uploaded file must be a valid zip file (.zip).'
        />
        <Row>
          <FeedAttributes feedSource={feedSource} feedTableViewType={feedTableViewType} />
          <FeedVersionAttributes
            feedTableViewType={feedTableViewType}
            lastFetchedDate={feedSource.lastFetched}
            retrievalMethod={feedSource.retrievalMethod}
            validation={feedSource.latestValidation}
          />
          <Col lg={4} md={12}>
            <Dropdown
              bsStyle='default'
              bsSize='small'
              id={`feed-source-action-button-${feedSource.id}`}
              onSelect={this._selectItem}
              style={{ marginTop: 8 }}
            >
              <Button
                bsStyle='default'
                disabled={editGtfsDisabled}
                onClick={this._onClickEdit}>
                <Glyphicon glyph='pencil' /> Edit
              </Button>
              <Dropdown.Toggle bsStyle='default' />
              <Dropdown.Menu>
                <MenuItem disabled={disabled || !feedSource.url} eventKey='fetch'><Glyphicon glyph='refresh' /> Fetch</MenuItem>
                <MenuItem disabled={disabled} eventKey='upload'><Glyphicon glyph='upload' /> Upload</MenuItem>

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
                    eventKey='deploy'>
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
                <MenuItem disabled={!feedSource.isPublic} eventKey='public'><Glyphicon glyph='link' /> View public page</MenuItem>
                <MenuItem divider />
                <MenuItem
                  data-test-id='feed-source-dropdown-delete-feed-source-button'
                  disabled={disabled}
                  eventKey='delete'
                >
                  <Icon type='trash' /> Delete
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </ListGroupItem>
    )
  }
}

class FeedAttributes extends PureComponent<{ feedSource: Feed, feedTableViewType: FeedTableViewType }> {
  render () {
    const {feedSource, feedTableViewType} = this.props

    return (
      <Col lg={4} md={12} className='feed-source-info'>
        <h4>
          <Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link>
        </h4>
        <AttributeGroup large>
          <Attribute
            icon='calendar-o'
            title='Last Update:'
            value={feedSource.lastUpdated
              ? moment(feedSource.lastUpdated).format(dateFormat)
              : 'No updates yet'}
          />
        </AttributeGroup>
        {feedTableViewType === 'detailed' &&
          <AttributeGroup>
            <Attribute
              icon='link'
              title='Has URL:'
              value={feedSource.url
                ? <a href={feedSource.url} target='_blank'>
                  Yes{' '}
                  <Icon type='external-link' />
                </a>
                : 'No'}
            />
            <Attribute
              icon='feed'
              title='Auto-update:'
              value={feedSource.retrievalMethod === 'FETCHED_AUTOMATICALLY'
                ? 'Enabled'
                : 'Disabled'}
            />
            <Attribute
              icon='rocket'
              title='Deployable:'
              value={feedSource.deployable ? 'Yes' : 'No'}
            />
          </AttributeGroup>
        }
      </Col>
    )
  }
}

class FeedVersionAttributes extends PureComponent<{
  feedTableViewType: FeedTableViewType,
  lastFetchedDate: ?number,
  retrievalMethod: RetrievalMethod,
  validation: ?ValidationSummary
}> {
  messages = getComponentMessages('FeedVersionAttributes')

  render () {
    const {feedTableViewType, lastFetchedDate, retrievalMethod, validation} = this.props

    let endMoment, startMoment
    let status: FeedSourceTableFilterStrategies
    if (validation) {
      endMoment = moment(validation.endDate)
      startMoment = moment(validation.startDate)
      status = endMoment.isBefore(moment())
        ? 'expired'
        : endMoment.isBefore(moment().add(5, 'days'))
          ? 'expiring-within-5-days'
          : endMoment.isBefore(moment().add(20, 'days'))
            ? 'expiring-within-20-days'
            : startMoment.isBefore(moment())
              ? 'active'
              : 'future'
    } else {
      status = 'no-version'
    }

    const {icon, className} = statusAttributeLookup[status]

    return (
      <Col lg={4} md={12} className='feed-source-info'>
        <h4>Latest Version:</h4>
        <AttributeGroup large>
          <Attribute
            className={className}
            icon={icon}
            title={this.messages(`status.${status}`)}
          />
        </AttributeGroup>
        {validation && feedTableViewType === 'detailed' && (
          <AttributeGroup>
            <Attribute
              icon='calendar-o'
              title='Start Date:'
              // $FlowFixMe startMoment will be initialized if validation exists
              value={startMoment.format(dateFormat)}
            />
            <Attribute
              icon='calendar-o'
              title='End Date:'
              // $FlowFixMe endMoment will be initialized if validation exists
              value={endMoment.format(dateFormat)}
            />
            <Attribute
              icon={retrievalMethod === 'MANUALLY_UPLOADED' ? 'upload' : 'link'}
              title={retrievalMethod === 'MANUALLY_UPLOADED' ? 'Uploaded:' : 'Fetched:'}
              value={moment(lastFetchedDate).format(dateFormat)}
            />
            <Attribute
              icon='exclamation-triangle'
              title='Validation Issues:'
              value={`${validation.errorCount}`}
            />
          </AttributeGroup>
        )}
      </Col>
    )
  }
}

class AttributeGroup extends PureComponent<{children: any, large?: boolean}> {
  render () {
    const {children, large} = this.props
    return (
      <table className={large ? 'large' : ''}>
        <tbody>
          {children}
        </tbody>
      </table>
    )
  }
}

class Attribute extends PureComponent<{
  className?: string,
  icon: string,
  title: string,
  value?: any
}> {
  render () {
    const {className, icon, title, value} = this.props
    return (
      <tr className={className}>
        <td><Icon type={icon} /></td>
        <td><b>{title}</b></td>
        {value && <td>{value}</td>}
      </tr>
    )
  }
}
