// @flow

import Icon from '@conveyal/woonerf/components/icon'
import moment from 'moment'
import React, {Component} from 'react'
import {
  Button,
  Dropdown,
  Glyphicon,
  ListGroupItem,
  MenuItem,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap'
import {shallowEqual} from 'react-pure-render'
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

type State = {
  hovered: boolean
}

export default class FeedSourceTableRow extends Component<Props, State> {
  state = {
    hovered: false
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return !shallowEqual(nextProps.feedSource, this.props.feedSource)
  }

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

  _toggleHover = () => this.setState({ hovered: !this.state.hovered })

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
    return (
      <ListGroupItem
        key={feedSource.id}
        onMouseEnter={this._toggleHover}
        onMouseLeave={this._toggleHover}>
        <div>
          <span
            className='pull-right'
            style={{marginTop: '5px'}}
          >
            <div>
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
              <Dropdown
                className='pull-right'
                bsStyle='default'
                bsSize='small'
                onSelect={this._selectItem}
                id={`feed-source-action-button`}
                pullRight>
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
            </div>
          </span>
          <h4 style={{margin: '0px'}}>
            <Link to={`/feed/${feedSource.id}`}>{feedSource.name}</Link>
            {' '}
            {!feedSource.isPublic
              ? <Icon
                className='text-warning'
                title='This feed source and all its versions are private.'
                type='lock'
              />
              : null
            }
            {' '}
            {/* feedSource.editedSinceSnapshot
              ? <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-warning' title='There are unpublished edits for this feed source.' type='circle' />
              : <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-success' title='No edits since last publish.' type='circle' />
            */}
          </h4>
          <FeedSourceAttributes feedSource={feedSource} />
        </div>
      </ListGroupItem>
    )
  }
}

class FeedSourceAttributes extends Component<{feedSource: Feed}> {
  messages = getComponentMessages('FeedSourceAttributes')

  render () {
    const {feedSource} = this.props
    const dateFormat = getConfigProperty('application.date_format') || ''
    const {latestValidation: versionSummary} = feedSource
    let dateString = ''
    let latestValidationEndMoment, isExpired, endDate, timeTo
    let errorCount = 0
    if (versionSummary) {
      latestValidationEndMoment = moment(versionSummary.endDate, 'YYYYMMDD')
      isExpired = latestValidationEndMoment.isBefore(moment())
      endDate = latestValidationEndMoment.format(dateFormat)
      errorCount = versionSummary.errorCount
      timeTo = moment().to(latestValidationEndMoment)
      dateString = isExpired
        ? `Latest version expired ${timeTo} (${endDate})`
        : `Latest version expires ${timeTo} (${endDate})`
    }
    return (
      <ul className='list-inline' style={{marginBottom: '0px'}}>
        <FeedSourceAttribute
          text={feedSource.lastUpdated
            ? `${this.messages('lastUpdated')} ${moment(feedSource.lastUpdated).format(dateFormat)}`
            : 'No versions exist yet.'
          }
          minWidth={200} />
        <FeedSourceAttribute
          icon={errorCount ? 'exclamation-triangle' : versionSummary ? 'check' : 'circle-o'}
          className={errorCount ? 'text-warning' : versionSummary ? 'text-success' : 'text-muted'}
          text={errorCount ? `${errorCount}` : undefined}
          title={errorCount ? `Latest version has ${errorCount} errors` : versionSummary ? 'Latest version is issue free!' : null}
          minWidth={40} />
        <FeedSourceAttribute
          icon={isExpired ? 'calendar-times-o' : versionSummary ? 'calendar-check-o' : 'calendar-o'}
          className={isExpired ? 'text-danger' : versionSummary ? 'text-success' : 'text-muted'}
          title={dateString}
          minWidth={40} />
        {isModuleEnabled('deployment')
          ? <FeedSourceAttribute
            icon={feedSource.deployable ? 'map' : 'map-o'}
            className={feedSource.deployable ? 'text-success' : 'text-muted'}
            minWidth={40}
            title={feedSource.deployable ? 'Feed source may be deployed to trip planner' : 'Depoyment to trip planner currently disabled'} />
          : null
        }
        {feedSource.url
          ? <FeedSourceAttribute
            icon={'link'}
            title={feedSource.url}
            className={'text-muted'}
            minWidth={40} />
          : null
        }
      </ul>
    )
  }
}

type AttributeProps = {
  className?: string,
  icon?: string,
  minWidth: number,
  text?: ?string,
  title?: ?string
}

class FeedSourceAttribute extends Component<AttributeProps> {
  render () {
    const { className, icon, minWidth, text, title } = this.props
    const li = (
      <li
        style={{
          minWidth: `${minWidth}px`,
          textAlign: icon ? 'center' : 'left'
        }}
        className={className}>
        {icon && <Icon type={icon} />}
        {text && ` ${text}`}
      </li>
    )
    return title
      ? <OverlayTrigger placement='bottom' overlay={<Tooltip id={title}>{title}</Tooltip>}>
        {li}
      </OverlayTrigger>
      : li
  }
}
