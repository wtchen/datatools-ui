import React, { Component, PropTypes } from 'react'
import moment from 'moment'

import { Button, Table, Checkbox, Glyphicon, Dropdown, MenuItem, Panel, ListGroupItem, ListGroup } from 'react-bootstrap'
import { browserHistory, Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
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
              <Button bsStyle='success' onClick={() => this.props.onNewFeedSourceClick()}><Icon type='plus'/> {getMessage(messages, 'feeds.createFirst')}</Button>
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
        header={
          <h4>
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
          {!fs.isPublic ? <Icon className='text-warning' title='This feed source and all its versions are private.' type='lock'/> : null}
          {' '}
          {fs.editedSinceSnapshot
            ? <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-warning' title='There are unpublished edits for this feed source.' type='circle'/>
            : <Icon style={{display: 'inline-block', paddingBottom: '3px', verticalAlign: 'middle', fontSize: '50%'}} className='text-success' title='No edits since last publish.' type='circle'/>
          }
          </h4>
        }
        key={fs.id}
        // bsStyle={fs.isPublic ? 'default' : 'warning'}
        onMouseEnter={() => {
            this.props.onHover(fs)
        }}
        onMouseLeave={() => {
          if (!this.props.hold)
            this.props.onHover(null)
        }}
      >
        <span
          className='pull-right'
          style={{marginTop: '-20px'}}
        >{this.props.active
          ? this.props.hoverComponent
          : null
        }
        </span>
        <ul className='list-inline' style={{marginBottom: '0px'}}>
        {fs.lastUpdated
          ? <li style={{minWidth: '200px'}}>{getMessage(messages, 'feeds.table.lastUpdated')} {moment(fs.lastUpdated).format(dateFormat)}</li>
          : <li style={{minWidth: '200px'}}>No versions exist yet.</li>
        }
          {fs.latestValidation && fs.latestValidation.errorCount > 0
            ? <li style={{minWidth: '40px', textAlign: 'center'}} className='text-warning'><Icon type='exclamation-triangle'/> {fs.latestValidation.errorCount}</li>
            : fs.latestValidation
            ? <li style={{minWidth: '40px', textAlign: 'center'}}><Icon className='text-success' type='check'/></li>
            : <li style={{minWidth: '40px', textAlign: 'center'}}><Icon className='text-muted' type='circle-o'/></li>
          }
          {fs.latestValidation && fs.latestValidation.endDate < +moment()
            ? <li style={{minWidth: '40px', textAlign: 'center'}} className='text-danger'><Icon type='calendar-times-o'/></li>
            : fs.latestValidation
            ? <li style={{minWidth: '40px', textAlign: 'center'}}><Icon className='text-success' type='calendar-check-o'/></li>
            : <li style={{minWidth: '40px', textAlign: 'center'}}><Icon className='text-muted' type='calendar-o'/></li>
          }
          {isModuleEnabled('deployment') && fs.deployable
            ? <li style={{minWidth: '40px', textAlign: 'center'}} className='text-success'><Icon type='map'/></li>
            : isModuleEnabled('deployment')
            ? <li style={{minWidth: '40px', textAlign: 'center'}} className='text-muted'><Icon type='map-o'/></li>
            : null
          }
          {fs.url
            ? <li style={{minWidth: '40px', textAlign: 'center'}} className='text-muted'><Icon type='link'/></li>
            : null
          }
        </ul>
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
  deleteFeed () {
    this.props.setHold(this.props.feedSource)
    this.refs['deleteModal'].open()
    // this.setState({keepActive: true})
  }
  uploadFeed () {
    this.props.setHold(this.props.feedSource)
    this.refs['uploadModal'].open()
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
        onConfirm={() => {
          console.log('OK, deleting')
          this.props.deleteFeedSource(fs)
        }}
        onClose={() => {
          this.props.setHold(false)
        }}
      />

      <SelectFileModal ref='uploadModal'
        title='Upload Feed'
        body='Select a GTFS feed to upload:'
        onConfirm={(files) => {
          if (isValidZipFile(files[0])) {
            this.props.uploadFeed(fs, files[0])
            this.props.setHold(false)
            return true
          } else {
            return false
          }
        }}
        onClose={() => {
          this.props.setHold(false)
        }}
        errorMessage='Uploaded file must be a valid zip file (.zip).'
      />

      <Dropdown
        className='pull-right'
        bsStyle='default'
        bsSize='small'
        onSelect={key => {
          switch (key) {
            case 'delete':
              return this.deleteFeed()
            case 'fetch':
              return this.props.fetchFeed(fs)
            case 'upload':
              return this.uploadFeed()
            case 'deploy':
              return this.props.createDeploymentFromFeedSource(fs)
            case 'public':
              return browserHistory.push(`/public/feed/${fs.id}`)
          }
        }}
        id={`feed-source-action-button`}
        pullRight
      >
        <Button
          bsStyle='default'
          disabled={editGtfsDisabled}
          onClick={() => browserHistory.push(`/feed/${fs.id}/edit/`) }
        >
          <Glyphicon glyph='pencil' /> Edit
        </Button>
        <Dropdown.Toggle bsStyle='default'/>
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
              ><Glyphicon glyph='globe'/> Deploy</MenuItem>
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
          <MenuItem disabled={!fs.isPublic} eventKey='public'><Glyphicon glyph='link'/> View public page</MenuItem>
          <MenuItem divider />
          <MenuItem disabled={disabled} eventKey='delete'><Icon type='trash'/> Delete</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  }
}
