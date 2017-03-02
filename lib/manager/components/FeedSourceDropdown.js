import Icon from '@conveyal/woonerf/components/icon'
import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { MenuItem, Dropdown, Glyphicon, Button } from 'react-bootstrap'

import { isValidZipFile } from '../../common/util/util'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import WatchButton from '../../common/containers/WatchButton'
import { isModuleEnabled, getConfigProperty } from '../../common/util/config'

export default class FeedSourceDropdown extends Component {

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
    const {
      feedSource,
      user,
      project,
      deleteFeedSource,
      setHold
    } = this.props
    const disabled = !user.permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'manage-feed')
    const isWatchingFeed = user.subscriptions.hasFeedSubscription(project.id, feedSource.id, 'feed-updated')
    const editGtfsDisabled = !user.permissions.hasFeedPermission(project.organizationId, project.id, feedSource.id, 'edit-gtfs')

    return <div>
      <ConfirmModal ref='deleteModal'
        title='Delete Feed Source?'
        body={`Are you sure you want to delete the feed source ${feedSource.name}?`}
        onConfirm={() => deleteFeedSource(feedSource)}
        onClose={() => setHold(false)}
      />

      <SelectFileModal ref='uploadModal'
        title='Upload Feed'
        body='Select a GTFS feed to upload:'
        onConfirm={(files) => this.confirmUpload(files)}
        onClose={() => setHold(false)}
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
          onClick={() => browserHistory.push(`/feed/${feedSource.id}/edit/`)}
        >
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
              disabled={disabled || !feedSource.deployable || !feedSource.feedVersionCount}
              title={disabled
                ? 'You do not have permission to deploy feed'
                : !feedSource.deployable
                ? 'Feed source is not deployable. Change in feed source settings.'
                : !feedSource.feedVersionCount
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
              user={user}
              target={feedSource.id}
              subscriptionType='feed-updated'
              componentClass='menuItem'
            />
            : null
          }
          <MenuItem disabled={!feedSource.isPublic} eventKey='public'><Glyphicon glyph='link' /> View public page</MenuItem>
          <MenuItem divider />
          <MenuItem disabled={disabled} eventKey='delete'><Icon type='trash' /> Delete</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  }
}
