import React, { Component, PropTypes } from 'react'
import moment from 'moment'

import { Button, Checkbox, Glyphicon, Dropdown, MenuItem, ListGroupItem, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import {Icon} from '@conveyal/woonerf'
import { shallowEqual } from 'react-pure-render'

import EditableTextField from '../../common/components/EditableTextField'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import WatchButton from '../../common/containers/WatchButton'
import { isModuleEnabled, getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'
import { isValidZipFile } from '../../common/util/util'

export default class FeedSourceTable extends Component {

  static propTypes = {
    feedSources: PropTypes.array,
    project: PropTypes.object,
    user: PropTypes.object,

    isFetching: PropTypes.bool,

    createDeploymentFromFeedSource: PropTypes.func,
    deleteFeedSource: PropTypes.func,
    updateFeedSourceProperty: PropTypes.func,
    saveFeedSource: PropTypes.func,
    fetchFeed: PropTypes.func,
    uploadFeed: PropTypes.func,
    onNewFeedSourceClick: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      activeFeedSource: null
    }
  }

  render () {
    const messages = getComponentMessages('ProjectViewer')

    const hover = <FeedSourceDropdown
      feedSource={this.state.activeFeedSource}
      project={this.props.project}
      user={this.props.user}
      createDeploymentFromFeedSource={(fs) => this.props.createDeploymentFromFeedSource(fs)}
      deleteFeedSource={(fs) => this.props.deleteFeedSource(fs)}
      uploadFeed={(fs, file) => this.props.uploadFeed(fs, file)}
      fetchFeed={(fs) => this.props.fetchFeed(fs)}
      setHold={(fs) => this.setState({holdFeedSource: fs})}
    />

    return (
      <ListGroup fill>
        {this.props.isFetching
          ? <ListGroupItem className='text-center'><Icon className='fa-2x fa-spin' type='refresh' /></ListGroupItem>
          : this.props.feedSources.length
          ? this.props.feedSources.map((feedSource) => {
            return <FeedSourceTableRow key={feedSource.id}
              feedSource={feedSource}
              project={this.props.project}
              user={this.props.user}
              updateFeedSourceProperty={this.props.updateFeedSourceProperty}
              saveFeedSource={this.props.saveFeedSource}
              hoverComponent={hover}
              onHover={(fs) => this.setState({activeFeedSource: fs})}
              active={this.state.activeFeedSource && this.state.activeFeedSource.id === feedSource.id}
              hold={this.state.holdFeedSource && this.state.holdFeedSource.id === feedSource.id}
            />
          })
          : <ListGroupItem className='text-center'>
            <Button bsStyle='success' onClick={() => this.props.onNewFeedSourceClick()}><Icon type='plus' /> {getMessage(messages, 'feeds.createFirst')}</Button>
          </ListGroupItem>
          }
      </ListGroup>
    )
  }
}

class FeedSourceTableRow extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    hoverComponent: PropTypes.node,
    project: PropTypes.object,
    user: PropTypes.object,

    updateFeedSourceProperty: PropTypes.func,
    saveFeedSource: PropTypes.func,
    onHover: PropTypes.func,
    active: PropTypes.bool,
    hold: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.state = {
      hovered: false
    }
  }
  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps.feedSource, this.props.feedSource) || this.props.active !== nextProps.active
  }
  render () {
    const fs = this.props.feedSource
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const dateFormat = getConfigProperty('application.date_format')
    const messages = getComponentMessages('ProjectViewer')
    const feedItem = (
      <ListGroupItem
        key={fs.id}
        onMouseEnter={() => this.props.onHover(fs)}
        onMouseLeave={() => {
          if (!this.props.hold) {
            this.props.onHover(null)
          }
        }}
      >
        <div>
          <span
            className='pull-right'
            style={{marginTop: '5px'}}
          >
            {this.props.active
              ? this.props.hoverComponent
              : null
            }
          </span>
          <h4 style={{margin: '0px'}}>
            <EditableTextField
              isEditing={(fs.isCreating === true)}
              value={fs.name}
              inline
              hideEditButton
              disabled={disabled}
              onChange={(value) => {
                if (fs.isCreating) this.props.saveFeedSource(value)
                else this.props.updateFeedSourceProperty(fs, 'name', value)
              }}
              link={`/feed/${fs.id}`}
            />
            {' '}
            {!fs.isPublic ? <Icon className='text-warning' title='This feed source and all its versions are private.' type='lock' /> : null}
            {' '}
            {fs.editedSinceSnapshot
              ? <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-warning' title='There are unpublished edits for this feed source.' type='circle' />
              : <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-success' title='No edits since last publish.' type='circle' />
            }
          </h4>
          <FeedSourceAttributes feedSource={fs} messages={messages} />
        </div>
      </ListGroupItem>
    )
    const feedRow = (
      <tr key={fs.id}
        onMouseEnter={() => {
          if (!this.state.hovered) {
            this.setState({ hovered: true })
            this.props.onHover(fs)
          }
        }}
        onMouseLeave={() => {
          if (!this.props.active && this.state.hovered) this.setState({ hovered: false })
        }}
      >
        <td className='col-md-4'>
          <div>
            <EditableTextField
              isEditing={(fs.isCreating === true)}
              value={fs.name}
              disabled={disabled}
              onChange={(value) => {
                if (fs.isCreating) this.props.saveFeedSource(value)
                else this.props.updateFeedSourceProperty(fs, 'name', value)
              }}
              link={`/feed/${fs.id}`}
            />
          </div>
        </td>
        <td>
          <Checkbox
            disabled={disabled}
            defaultChecked={fs.isPublic}
            onChange={(e) => {
              this.props.updateFeedSourceProperty(fs, 'isPublic', e.target.checked)
            }}
          />
        </td>
        <td>
          <Checkbox
            disabled={disabled}
            defaultChecked={fs.deployable}
            onChange={(e) => {
              this.props.updateFeedSourceProperty(fs, 'deployable', e.target.checked)
            }}
          />
        </td>
        <td>{fs.lastUpdated ? moment(fs.lastUpdated).format(dateFormat) : na}</td>
        <td>{fs.latestValidation ? fs.latestValidation.errorCount : na}</td>
        <td>{fs.latestValidation
          ? (<span>{moment(fs.latestValidation.startDate).format(dateFormat)} to {moment(fs.latestValidation.endDate).format(dateFormat)}</span>)
          : na
        }</td>
        <td className='col-xs-2'>
          {this.state.hovered
            ? this.props.hoverComponent
            : null
          }
        </td>
      </tr>
    )

    return feedItem
  }
}

class FeedSourceAttributes extends Component {
  render () {
    const { feedSource, messages } = this.props
    const dateFormat = getConfigProperty('application.date_format')
    const hasErrors = feedSource.latestValidation && feedSource.latestValidation.errorCount > 0
    const hasVersion = feedSource.latestValidation
    const isExpired = feedSource.latestValidation && feedSource.latestValidation.endDate < +moment()
    const end = feedSource.latestValidation && moment(feedSource.latestValidation.endDate)
    const endDate = end && end.format(dateFormat)
    const timeTo = end && moment().to(end)
    return (
      <ul className='list-inline' style={{marginBottom: '0px'}}>
        <Attribute
          text={feedSource.lastUpdated
            ? `${getMessage(messages, 'feeds.table.lastUpdated')} ${moment(feedSource.lastUpdated).format(dateFormat)}`
            : 'No versions exist yet.'
          }
          minWidth={200}
        />
        <Attribute
          icon={hasErrors ? 'exclamation-triangle' : hasVersion ? 'check' : 'circle-o'}
          className={hasErrors ? 'text-warning' : hasVersion ? 'text-success' : 'text-muted'}
          text={hasErrors && feedSource.latestValidation.errorCount}
          title={hasErrors ? `Latest version has ${feedSource.latestValidation.errorCount} errors` : hasVersion ? 'Latest version is issue free!' : null}
          minWidth={40}
        />
        <Attribute
          icon={isExpired ? 'calendar-times-o' : hasVersion ? 'calendar-check-o' : 'calendar-o'}
          className={isExpired ? 'text-danger' : hasVersion ? 'text-success' : 'text-muted'}
          title={isExpired ? `Latest version expired ${timeTo} (${endDate})` : hasVersion ? `Latest version expires ${timeTo} (${endDate})` : null}
          minWidth={40}
        />
        {isModuleEnabled('deployment')
          ? <Attribute
            icon={feedSource.deployable ? 'map' : 'map-o'}
            className={feedSource.deployable ? 'text-success' : 'text-muted'}
            minWidth={40}
            title={feedSource.deployable ? 'Feed source may be deployed to trip planner' : 'Depoyment to trip planner currently disabled'}
          />
          : null
        }
        {feedSource.url
          ? <Attribute
            icon={'link'}
            title={feedSource.url}
            className={'text-muted'}
            minWidth={40}
          />
          : null
        }
      </ul>
    )
  }
}

class Attribute extends Component {
  render () {
    const li = (
      <li
        style={{
          minWidth: `${this.props.minWidth}px`,
          textAlign: this.props.icon ? 'center' : 'left'
        }}
        className={this.props.className}
      >
        {this.props.icon && <Icon type={this.props.icon} />}
        {this.props.text && ` ${this.props.text}`}
      </li>
    )
    return this.props.title
    ? <OverlayTrigger placement='bottom' overlay={<Tooltip>{this.props.title}</Tooltip>}>
      {li}
    </OverlayTrigger>
    : li
  }
}

class FeedSourceDropdown extends Component {

  static propTypes = {
    feedSource: PropTypes.object,
    project: PropTypes.object,
    user: PropTypes.object,

    createDeploymentFromFeedSource: PropTypes.func,
    deleteFeedSource: PropTypes.func,
    fetchFeed: PropTypes.func,
    uploadFeed: PropTypes.func
  }
  _selectItem (key) {
    switch (key) {
      case 'delete':
        return this.deleteFeed()
      case 'fetch':
        return this.props.fetchFeed(this.props.feedSource)
      case 'upload':
        return this.uploadFeed()
      case 'deploy':
        return this.props.createDeploymentFromFeedSource(this.props.feedSource)
      case 'public':
        return browserHistory.push(`/public/feed/${this.props.feedSource.id}`)
    }
  }
  deleteFeed () {
    this.props.setHold(this.props.feedSource)
    this.refs['deleteModal'].open()
    // this.setState({keepActive: true})
  }
  uploadFeed () {
    this.props.setHold(this.props.feedSource)
    this.refs['uploadModal'].open()
  }
  confirmUpload (files) {
    const file = files[0]
    if (isValidZipFile(file)) {
      this.props.uploadFeed(this.props.feedSource, file)
      this.props.setHold(false)
      return true
    } else {
      return false
    }
  }
  render () {
    const fs = this.props.feedSource
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const isWatchingFeed = this.props.user.subscriptions.hasFeedSubscription(this.props.project.id, fs.id, 'feed-updated')
    const editGtfsDisabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'edit-gtfs')

    return <div>
      <ConfirmModal ref='deleteModal'
        title='Delete Feed Source?'
        body={`Are you sure you want to delete the feed source ${fs.name}?`}
        onConfirm={() => this.props.deleteFeedSource(fs)}
        onClose={() => this.props.setHold(false)}
      />

      <SelectFileModal ref='uploadModal'
        title='Upload Feed'
        body='Select a GTFS feed to upload:'
        onConfirm={(files) => this.confirmUpload(files)}
        onClose={() => this.props.setHold(false)}
        errorMessage='Uploaded file must be a valid zip file (.zip).'
      />

      <Dropdown
        className='pull-right'
        bsStyle='default'
        bsSize='small'
        onSelect={key => this._selectItem(key)}
        id={`feed-source-action-button`}
        pullRight
      >
        <Button
          bsStyle='default'
          disabled={editGtfsDisabled}
          onClick={() => browserHistory.push(`/feed/${fs.id}/edit/`)}
        >
          <Glyphicon glyph='pencil' /> Edit
        </Button>
        <Dropdown.Toggle bsStyle='default' />
        <Dropdown.Menu>
          <MenuItem disabled={disabled || !fs.url} eventKey='fetch'><Glyphicon glyph='refresh' /> Fetch</MenuItem>
          <MenuItem disabled={disabled} eventKey='upload'><Glyphicon glyph='upload' /> Upload</MenuItem>

          {/* show divider only if deployments and notifications are enabled (otherwise, we don't need it) */}
          {isModuleEnabled('deployment') || getConfigProperty('application.notifications_enabled')
            ? <MenuItem divider />
            : null
          }
          {isModuleEnabled('deployment')
            ? <MenuItem
              disabled={disabled || !fs.deployable || !fs.feedVersionCount}
              title={disabled
                ? 'You do not have permission to deploy feed'
                : !fs.deployable
                ? 'Feed source is not deployable. Change in feed source settings.'
                : !fs.feedVersionCount
                ? 'No versions exist. Create new version to deploy feed'
                : 'Deploy feed source.'
              }
              eventKey='deploy'
            >
              <Glyphicon glyph='globe' /> Deploy
            </MenuItem>
            : null
          }
          {getConfigProperty('application.notifications_enabled')
            ? <WatchButton
              isWatching={isWatchingFeed}
              user={this.props.user}
              target={fs.id}
              subscriptionType='feed-updated'
              componentClass='menuItem'
            />
            : null
          }
          <MenuItem disabled={!fs.isPublic} eventKey='public'><Glyphicon glyph='link' /> View public page</MenuItem>
          <MenuItem divider />
          <MenuItem disabled={disabled} eventKey='delete'><Icon type='trash' /> Delete</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  }
}
