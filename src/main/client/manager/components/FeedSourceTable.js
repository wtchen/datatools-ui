import React, { Component, PropTypes } from 'react'
import moment from 'moment'

import { Button, Table, Checkbox, Glyphicon, Dropdown, MenuItem } from 'react-bootstrap'
import { browserHistory } from 'react-router'
import Icon from 'react-fa'
import { shallowEqual } from 'react-pure-render'

import EditableTextField from '../../common/components/EditableTextField'
import ConfirmModal from '../../common/components/ConfirmModal'
import SelectFileModal from '../../common/components/SelectFileModal'
import WatchButton from '../../common/containers/WatchButton'
import { isModuleEnabled, getComponentMessages, getConfigProperty } from '../../common/util/config'

export default class FeedSourceTable extends Component {

  static propTypes = {
    feedSources: PropTypes.array,
    project: PropTypes.object,
    user: PropTypes.object,

    createDeploymentFromFeedSource: PropTypes.func,
    deleteFeedSource: PropTypes.func,
    updateFeedSourceProperty: PropTypes.func,
    saveFeedSource: PropTypes.func,
    fetchFeed: PropTypes.func,
    uploadFeed: PropTypes.func
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
    />

    return (
      <Table striped hover>
        <thead>
        <tr>
          <th className='col-md-4'>Name</th>
          <th>{messages.feeds.table.public}</th>
          <th>{messages.feeds.table.deployable}</th>
          <th>{messages.feeds.table.lastUpdated}</th>
          <th>{messages.feeds.table.errorCount}</th>
          <th>{messages.feeds.table.validRange}</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {this.props.feedSources.map((feedSource) => {
          return <FeedSourceTableRow key={feedSource.id}
            feedSource={feedSource}
            project={this.props.project}
            user={this.props.user}
            updateFeedSourceProperty={this.props.updateFeedSourceProperty}
            saveFeedSource={this.props.saveFeedSource}
            hoverComponent={hover}
            onHover={(fs) => this.setState({activeFeedSource: fs})}
          />
        })}
        </tbody>
      </Table>
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
    onHover: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      hovered: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !shallowEqual(nextProps.feedSource, this.props.feedSource) || this.state.hovered !== nextState.hovered
  }

  render () {
    const fs = this.props.feedSource
    const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    const dateFormat = getConfigProperty('application.date_format')

    return (
      <tr key={fs.id}
        onMouseEnter={() => {
          if (!this.state.hovered) {
            this.setState({ hovered: true })
            this.props.onHover(fs)
          }
        }}
        onMouseLeave={() => {
          if (this.state.hovered) this.setState({ hovered: false })
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
      />

      <SelectFileModal ref='uploadModal'
        title='Upload Feed'
        body='Select a GTFS feed to upload:'
        onConfirm={(files) => {
          let nameArray = files[0].name.split('.')
          if (files[0].type !== 'application/zip' || nameArray[nameArray.length - 1] !== 'zip') {
            return false
          } else {
            this.props.uploadFeed(fs, files[0])
            return true
          }
        }}
        errorMessage='Uploaded file must be a valid zip file (.zip).'
      />

      <Dropdown
        className='pull-right'
        bsStyle='default'
        onSelect={key => {
          console.log(key)
          switch (key) {
            case 'delete':
              return this.refs['deleteModal'].open()
            case 'fetch':
              return this.props.fetchFeed(fs)
            case 'upload':
              return this.refs['uploadModal'].open()
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
          {isModuleEnabled('deployment') || getConfigProperty('application.notifications_enabled')
            ? <MenuItem divider />
            : null
          }
          {isModuleEnabled('deployment')
            ? <MenuItem disabled={disabled || !fs.deployable} eventKey='deploy'><Glyphicon glyph='globe'/> Deploy</MenuItem>
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
          <MenuItem disabled={disabled} eventKey='delete'><Icon name='trash'/> Delete</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  }
}
