import React, { Component, PropTypes } from 'react'
import moment from 'moment'

import { Button, ListGroupItem, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import {Icon} from '@conveyal/woonerf'
import { shallowEqual } from 'react-pure-render'

import EditableTextField from '../../common/components/EditableTextField'
import FeedSourceDropdown from './FeedSourceDropdown'
import { isModuleEnabled, getComponentMessages, getMessage, getConfigProperty } from '../../common/util/config'

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
    // const na = (<span style={{ color: 'lightGray' }}>N/A</span>)
    const disabled = !this.props.user.permissions.hasFeedPermission(this.props.project.id, fs.id, 'manage-feed')
    // const dateFormat = getConfigProperty('application.date_format')
    const messages = getComponentMessages('ProjectViewer')
    return (
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
    ? <OverlayTrigger placement='bottom' overlay={<Tooltip id={this.props.title}>{this.props.title}</Tooltip>}>
      {li}
    </OverlayTrigger>
    : li
  }
}
